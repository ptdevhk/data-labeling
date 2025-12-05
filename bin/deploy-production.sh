#!/bin/bash
# Production deployment script
# This script runs ON THE SERVER via SSH from GitHub Actions or manually
#
# Usage:
#   deploy-production.sh <version_tag> [rollback]  # Deploy specific version
#   deploy-production.sh update                     # Check & deploy if updates available
#   deploy-production.sh status                     # Show current status
#
# Examples:
#   deploy-production.sh v1.2.3           # Deploy specific version
#   deploy-production.sh v1.2.3 rollback  # With auto-rollback on failure
#   deploy-production.sh update           # Daily update check

set -uo pipefail

#######################################
# Configuration (can be overridden via environment variables)
#######################################
DEPLOY_PATH="${DEPLOY_PATH:-/home/ubuntu/data-labeling}"
PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN:-labeling.pt-mes.com}"
PRODUCTION_PORT="${PRODUCTION_PORT:-5002}"
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost:${PRODUCTION_PORT}/health}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-5}"
HEALTH_CHECK_DELAY="${HEALTH_CHECK_DELAY:-3}"
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/backups/data-labeling}"
LOG_DIR="${LOG_DIR:-/home/ubuntu/logs}"
LOG_FILE="${LOG_DIR}/deploy-$(date +%Y%m%d_%H%M%S).log"
DEPLOY_START_TIME=$(date +%s)
LOCK_FILE="${LOG_DIR}/deploy-production.lock"
GIT_FETCH_RETRIES="${GIT_FETCH_RETRIES:-3}"
# Port binding: use "0.0.0.0" for external access (test VMs), "127.0.0.1" for localhost only (production with system Caddy)
PORT_BIND="${PORT_BIND:-127.0.0.1}"
# Docker build timeout in seconds (default 10 minutes)
DOCKER_BUILD_TIMEOUT="${DOCKER_BUILD_TIMEOUT:-600}"

#######################################
# Logging
#######################################
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    mkdir -p "$(dirname "$LOG_FILE")" 2>/dev/null || true
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE" 2>/dev/null || echo "[$timestamp] [$level] $message"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }

#######################################
# Error handling
#######################################
cleanup() {
    local exit_code=$?
    # Release lock
    release_lock
    if [ $exit_code -ne 0 ]; then
        log_error "Deployment failed with exit code: $exit_code"
        if [ "${ENABLE_ROLLBACK:-false}" = "true" ] && [ -n "${PREVIOUS_VERSION:-}" ]; then
            log_warn "Attempting rollback to $PREVIOUS_VERSION..."
            rollback "$PREVIOUS_VERSION"
        fi
    fi
}

trap cleanup EXIT

#######################################
# Deployment lock (prevent concurrent deployments)
#######################################
acquire_lock() {
    mkdir -p "$(dirname "$LOCK_FILE")" 2>/dev/null || true

    # Check if lock exists and is stale (older than 30 minutes)
    if [ -f "$LOCK_FILE" ]; then
        local lock_age=$(($(date +%s) - $(stat -c %Y "$LOCK_FILE" 2>/dev/null || echo "0")))
        if [ "$lock_age" -gt 1800 ]; then
            log_warn "Removing stale lock file (${lock_age}s old)"
            rm -f "$LOCK_FILE"
        else
            local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "unknown")
            log_error "Another deployment is in progress (PID: $lock_pid, age: ${lock_age}s)"
            log_error "If this is incorrect, remove: $LOCK_FILE"
            exit 1
        fi
    fi

    echo $$ > "$LOCK_FILE"
    log_info "Acquired deployment lock (PID: $$)"
}

release_lock() {
    if [ -f "$LOCK_FILE" ]; then
        local lock_pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
        if [ "$lock_pid" = "$$" ]; then
            rm -f "$LOCK_FILE"
            log_info "Released deployment lock"
        fi
    fi
}

#######################################
# Functions
#######################################

check_disk_space() {
    local min_space_mb=1000
    local available_mb=$(df -m "$DEPLOY_PATH" 2>/dev/null | awk 'NR==2 {print $4}' || echo "0")

    if [ "$available_mb" -lt "$min_space_mb" ]; then
        log_error "Low disk space: ${available_mb}MB available (need ${min_space_mb}MB)"
        exit 1
    fi
    log_info "Disk space OK: ${available_mb}MB available"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    if [ ! -d "$DEPLOY_PATH" ]; then
        log_error "Deploy path does not exist: $DEPLOY_PATH"
        exit 1
    fi

    export PATH="$HOME/.bun/bin:$PATH"
    if ! command -v bun &> /dev/null; then
        log_error "bun is not installed"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi

    # Check docker access (handle docker group not yet active)
    if ! docker info &> /dev/null; then
        log_warn "Docker not accessible. Trying with sg docker..."
        if sg docker -c "docker info" &> /dev/null; then
            log_info "Docker accessible via sg docker"
            # Re-exec script with docker group
            exec sg docker -c "$0 $*"
        else
            log_error "Cannot access Docker. Check docker group membership."
            exit 1
        fi
    fi

    mkdir -p "$BACKUP_DIR" 2>/dev/null || true
    check_disk_space
    log_info "Prerequisites check passed"
}

# Retry git fetch with exponential backoff
git_fetch_with_retry() {
    local retries=$GIT_FETCH_RETRIES
    local delay=2

    for ((i=1; i<=retries; i++)); do
        log_info "Git fetch attempt $i/$retries..."
        if git fetch --all --tags --prune 2>&1; then
            return 0
        fi
        if [ $i -lt $retries ]; then
            log_warn "Git fetch failed, retrying in ${delay}s..."
            sleep $delay
            delay=$((delay * 2))
        fi
    done

    log_error "Git fetch failed after $retries attempts"
    return 1
}

get_current_version() {
    cd "$DEPLOY_PATH"
    git describe --tags --always 2>/dev/null || echo "unknown"
}

get_current_commit() {
    cd "$DEPLOY_PATH"
    git rev-parse HEAD 2>/dev/null || echo "unknown"
}

backup_current() {
    log_info "Backing up current deployment..."
    local current_version=$(get_current_version)
    local backup_name="backup-${current_version}-$(date +%Y%m%d_%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"

    mkdir -p "$backup_path"
    cd "$DEPLOY_PATH"

    # Save git reference
    git rev-parse HEAD > "$backup_path/git.ref"

    # Backup .env file
    if [ -f "$DEPLOY_PATH/.env" ]; then
        cp "$DEPLOY_PATH/.env" "$backup_path/.env"
    fi

    # Backup frontend dist (for quick rollback without rebuild)
    if [ -d "$DEPLOY_PATH/web/dist" ]; then
        cp -r "$DEPLOY_PATH/web/dist" "$backup_path/web-dist"
        log_info "Frontend dist backed up"
    fi

    # Cleanup old backups (keep last 5)
    ls -dt "$BACKUP_DIR"/backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true

    log_info "Backup created: $backup_name"
    echo "$current_version"
}

fetch_and_checkout() {
    local version="$1"
    log_info "Fetching and checking out version: $version"

    cd "$DEPLOY_PATH"

    # Handle dirty git state (local changes from docker-compose.yml edits, etc.)
    if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
        log_warn "Detected uncommitted changes, stashing..."
        git stash push -m "deploy-auto-stash-$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    fi

    git_fetch_with_retry
    git checkout "$version"

    local actual_ref=$(git describe --tags --always)
    log_info "Checked out: $actual_ref"
}

build_frontend() {
    log_info "Building frontend..."
    cd "$DEPLOY_PATH/web"

    # Ensure bun is in PATH
    export PATH="$HOME/.bun/bin:/usr/local/bin:$PATH"

    # Use --ignore-scripts to skip native module compilation (canvas, etc.)
    # This speeds up installs significantly on servers
    log_info "Installing dependencies..."
    if [ -f "bun.lockb" ]; then
        bun install --frozen-lockfile --ignore-scripts || bun install --ignore-scripts
    else
        bun install --ignore-scripts
    fi

    log_info "Running build..."
    bun run build

    if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
        log_error "Frontend build failed - dist/index.html not found"
        exit 1
    fi

    log_info "Frontend build complete"
}

deploy_containers() {
    log_info "Deploying containers..."
    cd "$DEPLOY_PATH"

    # Apply port binding configuration (for test VMs without system Caddy)
    if [ "$PORT_BIND" != "127.0.0.1" ]; then
        log_info "Configuring port binding to $PORT_BIND:$PRODUCTION_PORT"
        sed -i "s/127.0.0.1:${PRODUCTION_PORT}:/${PORT_BIND}:${PRODUCTION_PORT}:/g" docker-compose.yml 2>/dev/null || true
    fi

    # Stop existing containers gracefully with timeout
    log_info "Stopping existing containers..."
    docker compose -f docker-compose.yml down --remove-orphans --timeout 30 2>/dev/null || true

    # Clean up any orphaned containers from previous failed deployments
    docker container prune -f 2>/dev/null || true

    # Build with timeout protection
    log_info "Building containers (timeout: ${DOCKER_BUILD_TIMEOUT}s)..."
    if ! timeout "$DOCKER_BUILD_TIMEOUT" docker compose -f docker-compose.yml build --no-cache 2>&1; then
        log_error "Docker build timed out or failed"
        exit 1
    fi

    # Start containers
    log_info "Starting containers..."
    if ! docker compose -f docker-compose.yml up -d 2>&1; then
        log_error "Failed to start containers"
        docker compose -f docker-compose.yml logs --tail=30 2>/dev/null || true
        exit 1
    fi

    # Give containers time to initialize
    sleep 2

    log_info "Containers deployed"
}

health_check() {
    log_info "Running health checks..."
    local retries=$HEALTH_CHECK_RETRIES
    local delay=$HEALTH_CHECK_DELAY
    local timeout=5

    for ((i=1; i<=retries; i++)); do
        log_info "Health check attempt $i/$retries..."

        # Use --connect-timeout and --max-time for robust timeout handling
        if curl -sf --connect-timeout "$timeout" --max-time "$((timeout * 2))" "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log_info "Health check passed!"
            return 0
        fi

        if [ $i -lt $retries ]; then
            log_warn "Health check failed, retrying in ${delay}s..."
            sleep $delay
        fi
    done

    log_error "Health check failed after $retries attempts"
    log_info "Container logs:"
    docker compose -f docker-compose.yml logs --tail=50 2>/dev/null || true
    return 1
}

rollback() {
    local version="$1"
    log_warn "Rolling back to version: $version"

    cd "$DEPLOY_PATH"
    git checkout "$version"

    build_frontend
    docker compose -f docker-compose.yml build
    docker compose -f docker-compose.yml down --remove-orphans
    docker compose -f docker-compose.yml up -d

    if health_check; then
        log_info "Rollback successful"
    else
        log_error "Rollback also failed!"
        exit 1
    fi
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."
    docker image prune -f --filter "until=168h" 2>/dev/null || true
    log_info "Cleanup complete"
}

#######################################
# Check for updates and deploy if needed
#######################################
check_and_update() {
    log_info "========================================="
    log_info "Checking for updates..."
    log_info "========================================="

    check_prerequisites
    acquire_lock

    cd "$DEPLOY_PATH"

    # Get current state
    local current_commit=$(get_current_commit)
    local current_version=$(get_current_version)
    log_info "Current version: $current_version ($current_commit)"

    # Fetch latest with retry
    git_fetch_with_retry

    # Get latest tag
    local latest_tag=$(git describe --tags --abbrev=0 origin/main 2>/dev/null || echo "")

    if [ -z "$latest_tag" ]; then
        # No tags, check for new commits on main
        local remote_commit=$(git rev-parse origin/main 2>/dev/null || echo "")

        if [ "$current_commit" = "$remote_commit" ]; then
            log_info "========================================="
            log_info "No updates available. Already up to date."
            log_info "Current: $current_version"
            log_info "========================================="
            echo "UPDATE_STATUS=no_updates"
            return 0
        else
            log_info "New commits available on main"
            deploy_version "origin/main"
        fi
    else
        # Check if we're on the latest tag
        local current_tag_commit=$(git rev-list -n 1 "$current_version" 2>/dev/null || echo "none")
        local latest_tag_commit=$(git rev-list -n 1 "$latest_tag" 2>/dev/null || echo "")

        if [ "$current_tag_commit" = "$latest_tag_commit" ]; then
            log_info "========================================="
            log_info "No updates available. Already on latest."
            log_info "Current: $current_version"
            log_info "Latest:  $latest_tag"
            log_info "========================================="
            echo "UPDATE_STATUS=no_updates"
            return 0
        else
            log_info "New version available: $latest_tag (current: $current_version)"
            deploy_version "$latest_tag"
        fi
    fi
}

deploy_version() {
    local version="$1"

    log_info "========================================="
    log_info "Deploying version: $version"
    log_info "========================================="

    # Backup current version
    PREVIOUS_VERSION=$(backup_current)
    export PREVIOUS_VERSION
    export ENABLE_ROLLBACK=true

    fetch_and_checkout "$version"
    build_frontend
    deploy_containers

    if health_check; then
        local deploy_end_time=$(date +%s)
        local deploy_duration=$((deploy_end_time - DEPLOY_START_TIME))
        log_info "========================================="
        log_info "Deployment successful!"
        log_info "Version: $(get_current_version)"
        log_info "URL: https://${PRODUCTION_DOMAIN}"
        log_info "Duration: ${deploy_duration}s"
        log_info "========================================="
        cleanup_old_images
        echo "UPDATE_STATUS=deployed"
        echo "DEPLOYED_VERSION=$(get_current_version)"
        echo "DEPLOY_DURATION=${deploy_duration}s"
    else
        log_error "Deployment verification failed"
        echo "UPDATE_STATUS=failed"
        exit 1
    fi
}

#######################################
# Show status
#######################################
show_status() {
    echo ""
    echo "Production Deployment Status"
    echo "============================="
    echo ""

    if [ -d "$DEPLOY_PATH" ]; then
        cd "$DEPLOY_PATH"
        echo "Path:    $DEPLOY_PATH"
        echo "Version: $(get_current_version)"
        echo "Commit:  $(get_current_commit)"
        echo "Branch:  $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'detached')"
        echo ""

        # Check containers
        if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "data-labeling"; then
            echo "Containers: RUNNING"
        else
            echo "Containers: STOPPED"
        fi

        # Health check
        if curl -sf "$HEALTH_CHECK_URL" -o /dev/null 2>/dev/null; then
            echo "Health:     OK"
        else
            echo "Health:     NOT RESPONDING"
        fi

        # Check for updates
        git fetch --all --tags --prune 2>/dev/null
        local latest_tag=$(git describe --tags --abbrev=0 origin/main 2>/dev/null || echo "none")
        echo ""
        echo "Latest tag: $latest_tag"
    else
        echo "Production not deployed at $DEPLOY_PATH"
    fi

    echo ""
    echo "URL: https://${PRODUCTION_DOMAIN}"
    echo ""
}

#######################################
# Main
#######################################
main() {
    local action="${1:-}"

    case "$action" in
        update)
            check_and_update
            ;;

        status)
            show_status
            ;;

        "")
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  <version>           Deploy specific version (e.g., v1.2.3)"
            echo "  <version> rollback  Deploy with auto-rollback on failure"
            echo "  update              Check for updates and deploy if available"
            echo "  status              Show current deployment status"
            exit 1
            ;;

        *)
            # Assume it's a version tag
            local version="$action"
            local enable_rollback="${2:-}"

            if [ "$enable_rollback" = "rollback" ]; then
                export ENABLE_ROLLBACK=true
            fi

            log_info "========================================="
            log_info "Starting production deployment"
            log_info "Version: $version"
            log_info "Rollback enabled: ${ENABLE_ROLLBACK:-false}"
            log_info "========================================="

            check_prerequisites
            acquire_lock
            deploy_version "$version"
            ;;
    esac
}

main "$@"
