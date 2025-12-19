#!/bin/bash
# Preview deployment script - Single slot preview at preview.pt-mes.com
# This script runs ON THE SERVER via SSH from GitHub Actions
#
# Design:
# - Single preview slot at preview.pt-mes.com (port 4173)
# - Any new preview overwrites the previous one
# - Failures are non-critical (don't block PR workflows)
# - Last successful deployment info stored in .current file
#
# Usage:
#   deploy-preview.sh deploy <preview_name> <git_sha> <github_repo>
#   deploy-preview.sh cleanup
#   deploy-preview.sh status

set -uo pipefail  # Note: no -e, we handle errors manually for resilience

#######################################
# Configuration (can be overridden via environment variables)
#######################################
PREVIEW_PATH="${PREVIEW_PATH:-/home/ubuntu/data-labeling-preview}"
PREVIEW_DOMAIN="${PREVIEW_DOMAIN:-preview.pt-mes.com}"
PREVIEW_PORT="${PREVIEW_PORT:-4173}"
# Set to "0.0.0.0" for external access, or "127.0.0.1" for localhost only (when using system Caddy)
PORT_BIND="${PORT_BIND:-127.0.0.1}"
CURRENT_FILE="${PREVIEW_PATH}/.current"
LOG_DIR="${LOG_DIR:-/home/ubuntu/logs}"
LOG_FILE="${LOG_DIR}/preview-$(date +%Y%m%d).log"
DEPLOY_START_TIME=$(date +%s)
GIT_FETCH_RETRIES="${GIT_FETCH_RETRIES:-3}"
# Docker build timeout in seconds (default 10 minutes)
DOCKER_BUILD_TIMEOUT="${DOCKER_BUILD_TIMEOUT:-600}"
# Bun install timeout in seconds (default 5 minutes)
BUN_INSTALL_TIMEOUT="${BUN_INSTALL_TIMEOUT:-300}"

#######################################
# Logging
#######################################
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE" 2>/dev/null || echo "[$timestamp] [$level] $message"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

#######################################
# Resilient command execution
#######################################
run_cmd() {
    local description="$1"
    shift
    log_info "Running: $description"
    if "$@"; then
        log_info "Success: $description"
        return 0
    else
        log_warn "Failed: $description (continuing...)"
        return 1
    fi
}

#######################################
# Health check (non-blocking)
#######################################
health_check() {
    local url="http://localhost:${PREVIEW_PORT}/health"
    local retries=5
    local delay=3

    for ((i=1; i<=retries; i++)); do
        log_info "Health check attempt $i/$retries..."
        if curl -sf "$url" -o /dev/null 2>/dev/null; then
            log_info "Health check passed"
            return 0
        fi
        if [ $i -lt $retries ]; then
            sleep $delay
        fi
    done

    log_warn "Health check did not pass (preview may still be starting)"
    # Show container logs to help debug
    docker compose -f docker-compose.preview.yml -p preview logs --tail=20 2>/dev/null || true
    return 1
}

#######################################
# Disk space check
#######################################
check_disk_space() {
    local min_space_mb=500
    local available_mb=$(df -m "$PREVIEW_PATH" 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")

    if [ "$available_mb" -lt "$min_space_mb" ]; then
        log_error "Low disk space: ${available_mb}MB available (need ${min_space_mb}MB)"
        echo "PREVIEW_STATUS=low_disk_space"
        return 1
    fi
    log_info "Disk space OK: ${available_mb}MB available"
    return 0
}

#######################################
# Check docker access
#######################################
check_docker_access() {
    export PATH="$HOME/.bun/bin:$PATH"

    if ! docker info &> /dev/null; then
        log_warn "Docker not accessible. Trying with sg docker..."
        if sg docker -c "docker info" &> /dev/null; then
            log_info "Docker accessible via sg docker"
            # Re-exec script with docker group
            exec sg docker -c "$0 $*"
        else
            log_error "Cannot access Docker. Check docker group membership."
            echo "PREVIEW_STATUS=docker_access_error"
            return 1
        fi
    fi
    return 0
}

#######################################
# Git fetch with retry
#######################################
git_fetch_with_retry() {
    local retries=$GIT_FETCH_RETRIES
    local delay=2

    for ((i=1; i<=retries; i++)); do
        log_info "Git fetch attempt $i/$retries..."
        if git fetch --all --prune 2>&1; then
            return 0
        fi
        if [ $i -lt $retries ]; then
            log_warn "Git fetch failed, retrying in ${delay}s..."
            sleep $delay
            delay=$((delay * 2))
        fi
    done

    log_warn "Git fetch failed after $retries attempts (continuing anyway)"
    return 1
}

#######################################
# Deploy
#######################################
deploy_preview() {
    local preview_name="$1"
    local git_sha="$2"
    local github_repo="$3"

    log_info "========================================="
    log_info "Deploying preview environment"
    log_info "Name: $preview_name"
    log_info "SHA: ${git_sha:0:7}"
    log_info "Repo: $github_repo"
    log_info "URL: https://${PREVIEW_DOMAIN}"
    log_info "========================================="

    # Create directories
    mkdir -p "$PREVIEW_PATH" 2>/dev/null || true
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true

    # Check prerequisites
    check_docker_access || return 1
    check_disk_space || return 1

    # Stop existing preview (ignore errors)
    if [ -f "${PREVIEW_PATH}/docker-compose.preview.yml" ]; then
        log_info "Stopping existing preview..."
        cd "$PREVIEW_PATH" 2>/dev/null && \
            docker compose -f docker-compose.preview.yml -p preview down --remove-orphans 2>/dev/null || true
    fi

    # Clone or update repository
    if [ ! -d "${PREVIEW_PATH}/.git" ]; then
        log_info "Cloning repository..."
        rm -rf "$PREVIEW_PATH" 2>/dev/null || true
        # Try SSH first (for private repos), fall back to HTTPS (for public repos)
        if ! git clone "git@github.com:${github_repo}.git" "$PREVIEW_PATH" 2>&1; then
            log_warn "SSH clone failed, trying HTTPS..."
            if ! git clone "https://github.com/${github_repo}.git" "$PREVIEW_PATH" 2>&1; then
                log_error "Failed to clone repository"
                echo "PREVIEW_STATUS=clone_failed"
                return 1
            fi
        fi
    fi

    cd "$PREVIEW_PATH" || {
        log_error "Failed to change to preview directory"
        echo "PREVIEW_STATUS=directory_error"
        return 1
    }

    # Handle dirty git state
    if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
        log_warn "Detected uncommitted changes, resetting..."
        git reset --hard HEAD 2>/dev/null || true
    fi

    # Fetch and checkout with retry
    git_fetch_with_retry || true

    # Try to checkout the specific SHA
    if ! git checkout "$git_sha" 2>&1; then
        log_warn "SHA $git_sha not found, trying to fetch PR ref..."

        # Check if preview_name starts with "pr-" to determine PR number
        if [[ "$preview_name" == pr-* ]]; then
            pr_number="${preview_name#pr-}"
            log_info "Fetching PR #$pr_number ref..."

            # First, move to detached HEAD to allow branch operations
            # This avoids "refusing to fetch into branch checked out" error
            git checkout --detach HEAD 2>/dev/null || true

            # Delete old PR branch if it exists (to allow fresh fetch)
            git branch -D "pr-${pr_number}" 2>/dev/null || true

            # Fetch the PR head ref directly from GitHub
            if git fetch origin "pull/${pr_number}/head:pr-${pr_number}" 2>&1; then
                if git checkout "pr-${pr_number}" 2>&1; then
                    log_info "Successfully checked out PR #$pr_number"
                else
                    log_error "Failed to checkout PR ref"
                    echo "PREVIEW_STATUS=checkout_failed"
                    return 1
                fi
            else
                log_error "Failed to fetch PR ref"
                echo "PREVIEW_STATUS=checkout_failed"
                return 1
            fi
        else
            # For branch-based previews, try to fetch and checkout the branch
            log_warn "Attempting to find branch for preview: $preview_name"

            # Try to match the preview name back to a branch
            if git fetch origin 2>&1 && git checkout "origin/HEAD" 2>&1; then
                log_warn "Fell back to origin/HEAD"
            else
                log_error "Failed to checkout $git_sha"
                echo "PREVIEW_STATUS=checkout_failed"
                return 1
            fi
        fi
    fi

    # Create .env with unique secret key for preview
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env 2>/dev/null || true
            # Generate unique secret key for preview
            NEW_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | xxd -p | tr -d '\n' | head -c 64)
            sed -i "s/API_SECRET_KEY=.*/API_SECRET_KEY=\"$NEW_SECRET\"/" .env 2>/dev/null || true
            log_info "Created .env with new secret key"
        fi
    fi
    # Always set environment to preview
    sed -i "s/ENVIRONMENT=.*/ENVIRONMENT=preview/" .env 2>/dev/null || true

    # Create docker-compose.preview.yml
    cat > docker-compose.preview.yml << EOF
services:
  backend:
    restart: unless-stopped
    env_file:
      - .env
    build:
      context: ./
      dockerfile: ./dockerfiles/python313/Dockerfile
      args:
        TZ: Asia/Hong_Kong
        ENVIRONMENT: preview

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "${PORT_BIND}:${PREVIEW_PORT}:5002"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./apps/web/dist:/web/dist:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - backend

volumes:
  caddy_data:
  caddy_config:
EOF

    # Build frontend (monorepo: install at root, build lib then web)
    log_info "Building frontend..."
    export PATH="$HOME/.bun/bin:/usr/local/bin:$PATH"

    if command -v bun &> /dev/null; then
        # Use --ignore-scripts to skip native module compilation (canvas, etc.)
        # Add timeout protection for slow network connections
        log_info "Installing workspace dependencies (timeout: ${BUN_INSTALL_TIMEOUT}s)..."
        if ! timeout "$BUN_INSTALL_TIMEOUT" bun install --ignore-scripts 2>&1; then
            log_warn "Bun install timed out or failed, trying npm..."
            timeout "$BUN_INSTALL_TIMEOUT" npm install 2>&1 || {
                log_warn "Failed to install dependencies (continuing anyway)"
            }
        fi

        log_info "Building library..."
        if ! bun run build:lib 2>&1; then
            log_warn "Library build failed (continuing anyway)"
        fi

        log_info "Building frontend..."
        if ! bun run build:web 2>&1; then
            log_warn "Bun build failed, trying npm..."
            if ! npm run build:web 2>&1; then
                log_error "Failed to build frontend"
                echo "PREVIEW_STATUS=build_failed"
                return 1
            fi
        fi
    else
        log_warn "bun not found, trying npm"
        timeout "$BUN_INSTALL_TIMEOUT" npm install 2>&1 && npm run build:lib 2>&1 && npm run build:web 2>&1 || {
            log_error "Failed to build frontend"
            echo "PREVIEW_STATUS=build_failed"
            return 1
        }
    fi

    # Verify build output
    if [ ! -f "apps/web/dist/index.html" ]; then
        log_error "Frontend build output not found"
        echo "PREVIEW_STATUS=build_missing"
        return 1
    fi

    # Deploy containers
    log_info "Stopping any existing preview containers..."
    docker compose -f docker-compose.preview.yml -p preview down --remove-orphans --timeout 30 2>/dev/null || true

    # Clean up any orphaned containers
    docker container prune -f 2>/dev/null || true

    log_info "Building containers (timeout: ${DOCKER_BUILD_TIMEOUT}s)..."
    if ! timeout "$DOCKER_BUILD_TIMEOUT" docker compose -f docker-compose.preview.yml -p preview build 2>&1; then
        log_warn "Docker build had issues (attempting to continue)"
    fi

    log_info "Starting containers..."
    if ! docker compose -f docker-compose.preview.yml -p preview up -d 2>&1; then
        log_error "Failed to start containers"
        docker compose -f docker-compose.preview.yml -p preview logs --tail=30 2>/dev/null || true
        echo "PREVIEW_STATUS=container_failed"
        return 1
    fi

    # Save current deployment info
    cat > "$CURRENT_FILE" << EOF
name=$preview_name
sha=$git_sha
repo=$github_repo
deployed=$(date -Iseconds)
url=https://${PREVIEW_DOMAIN}
EOF

    # Health check (non-blocking)
    sleep 3
    health_check || true

    # Calculate deployment duration
    local deploy_end_time=$(date +%s)
    local deploy_duration=$((deploy_end_time - DEPLOY_START_TIME))

    log_info "========================================="
    log_info "Preview deployment complete!"
    log_info "URL: https://${PREVIEW_DOMAIN}"
    log_info "Duration: ${deploy_duration}s"
    log_info "========================================="

    # Output for GitHub Actions
    echo "PREVIEW_URL=https://${PREVIEW_DOMAIN}"
    echo "PREVIEW_STATUS=success"
    echo "PREVIEW_NAME=$preview_name"
    echo "PREVIEW_SHA=${git_sha:0:7}"
    echo "PREVIEW_DURATION=${deploy_duration}s"

    return 0
}

#######################################
# Cleanup
#######################################
cleanup_preview() {
    log_info "========================================="
    log_info "Cleaning up preview environment"
    log_info "========================================="

    if [ -d "$PREVIEW_PATH" ]; then
        cd "$PREVIEW_PATH" 2>/dev/null || true

        # Stop containers
        docker compose -f docker-compose.preview.yml -p preview down -v --remove-orphans 2>/dev/null || true

        # Remove current file but keep directory for next deploy
        rm -f "$CURRENT_FILE" 2>/dev/null || true

        log_info "Preview cleanup complete"
    else
        log_info "No preview to clean up"
    fi

    echo "PREVIEW_STATUS=cleaned"
}

#######################################
# Status
#######################################
show_status() {
    echo ""
    echo "Preview Environment Status"
    echo "=========================="
    echo ""

    if [ -f "$CURRENT_FILE" ]; then
        echo "Current deployment:"
        cat "$CURRENT_FILE" | sed 's/^/  /'
        echo ""

        # Check if running
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "preview"; then
            echo "Container status: RUNNING"

            # Health check
            if curl -sf "http://localhost:${PREVIEW_PORT}/health" -o /dev/null 2>/dev/null; then
                echo "Health: OK"
            else
                echo "Health: NOT RESPONDING"
            fi
        else
            echo "Container status: STOPPED"
        fi
    else
        echo "No preview currently deployed"
    fi

    echo ""
    echo "URL: https://${PREVIEW_DOMAIN}"
    echo ""
}

#######################################
# Main
#######################################
main() {
    local action="${1:-status}"

    case "$action" in
        deploy)
            local preview_name="${2:-}"
            local git_sha="${3:-}"
            local github_repo="${4:-}"

            if [ -z "$preview_name" ] || [ -z "$git_sha" ] || [ -z "$github_repo" ]; then
                echo "Usage: $0 deploy <preview_name> <git_sha> <github_repo>"
                echo "PREVIEW_STATUS=invalid_args"
                exit 1
            fi

            deploy_preview "$preview_name" "$git_sha" "$github_repo"
            ;;

        cleanup)
            cleanup_preview
            ;;

        status)
            show_status
            ;;

        *)
            echo "Usage: $0 <action> [args...]"
            echo ""
            echo "Actions:"
            echo "  deploy <name> <sha> <repo>  Deploy preview (overwrites existing)"
            echo "  cleanup                     Stop and clean preview"
            echo "  status                      Show current preview status"
            echo ""
            echo "Note: Preview uses single slot at preview.pt-mes.com"
            exit 1
            ;;
    esac
}

main "$@"
