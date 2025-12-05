#!/bin/bash
# Setup SSH deploy key for GitHub Actions
#
# This script:
# 1. Generates a dedicated deploy key (ed25519) for GitHub Actions
# 2. Copies the public key to the production server's ubuntu user
# 3. Provides instructions to add the private key to GitHub secrets
#
# Prerequisites:
# - Root SSH access to production server (for initial setup)
# - DEPLOY_HOST set via environment variable or .env file
#
# Usage:
#   ./bin/setup-deploy-key.sh                           # Uses .env (default)
#   ./bin/setup-deploy-key.sh --env-file .env.production
#   ./bin/setup-deploy-key.sh -e .env.staging
#   DEPLOY_HOST=my-server.com ./bin/setup-deploy-key.sh # Override via env var

set -euo pipefail

#######################################
# Configuration
#######################################
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_KEY_NAME="${DEPLOY_KEY_NAME:-github-actions-deploy}"
DEPLOY_KEY_PATH="${DEPLOY_KEY_PATH:-$HOME/.ssh/${DEPLOY_KEY_NAME}}"
REPO_DEPLOY_KEY_NAME="${REPO_DEPLOY_KEY_NAME:-github-repo-deploy}"
REPO_DEPLOY_KEY_PATH="${REPO_DEPLOY_KEY_PATH:-$HOME/.ssh/${REPO_DEPLOY_KEY_NAME}}"
ENV_FILE=""
FORCE_OVERWRITE=false
AUTO_YES=false
SKIP_REPO_KEY=false
USE_PAT=false

#######################################
# Colors
#######################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_ok() { echo -e "${GREEN}✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*"; }
log_err() { echo -e "${RED}✗${NC} $*"; }
log_info() { echo -e "${BLUE}→${NC} $*"; }

#######################################
# Usage
#######################################
usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Setup SSH deploy key for GitHub Actions deployment.

Options:
  -e, --env-file FILE   Load environment from FILE (default: .env)
  -f, --force           Overwrite existing deploy key without prompting
  -y, --yes             Auto-confirm all prompts (non-interactive mode)
  --skip-repo-key       Skip adding deploy key to GitHub repo (for public repos)
  --use-pat             Use Personal Access Token for private repo access (instead of deploy key)
  -h, --help            Show this help message

Examples:
  $(basename "$0")                           # Uses .env (default)
  $(basename "$0") --env-file .env.production
  $(basename "$0") -e .env.staging -y        # Non-interactive
  $(basename "$0") --force --yes             # Overwrite key, auto-confirm
  $(basename "$0") --skip-repo-key           # Public repo, no repo deploy key needed
  $(basename "$0") --use-pat                 # Use PAT for private repo (prompts for token)
  DEPLOY_HOST=my-server.com $(basename "$0") # Override via env var

Environment Variables (from .env file or command line):
  DEPLOY_HOST       Server IP or hostname (required)
  DEPLOY_USER       SSH user for deployment (default: ubuntu)
  DEPLOY_PORT       SSH port (default: 22)
  ROOT_USER         Root user for initial setup (default: root)
  ROOT_SSH_KEY      SSH key for root access (default: auto-detect)
  DEPLOY_KEY_NAME   Name for the deploy key (default: github-actions-deploy)
  DEPLOY_KEY_PATH   Path to store the key (default: ~/.ssh/github-actions-deploy)
  GITHUB_REPO       Repository for secrets (default: auto-detect from git remote)
  GITHUB_PAT        Personal Access Token for private repo access (optional)

Note: For PRIVATE repositories, this script can use either:
  1. Deploy key (SSH) - Generates key and adds to GitHub repo (default)
  2. Personal Access Token (HTTPS) - Use --use-pat flag
EOF
}

#######################################
# Parse arguments
#######################################
parse_args() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -e|--env-file)
                if [ -z "${2:-}" ]; then
                    log_err "Option $1 requires an argument"
                    usage
                    exit 1
                fi
                ENV_FILE="$2"
                shift 2
                ;;
            -f|--force)
                FORCE_OVERWRITE=true
                shift
                ;;
            -y|--yes)
                AUTO_YES=true
                shift
                ;;
            --skip-repo-key)
                SKIP_REPO_KEY=true
                shift
                ;;
            --use-pat)
                USE_PAT=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_err "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
}

#######################################
# Load environment from .env files
#######################################
load_env() {
    local env_files=()

    # If --env-file specified, use only that file
    if [ -n "$ENV_FILE" ]; then
        # Handle relative paths
        if [[ "$ENV_FILE" != /* ]]; then
            ENV_FILE="$PROJECT_ROOT/$ENV_FILE"
        fi
        if [ ! -f "$ENV_FILE" ]; then
            log_err "Environment file not found: $ENV_FILE"
            exit 1
        fi
        env_files=("$ENV_FILE")
    else
        # Default search order
        env_files=(
            "$PROJECT_ROOT/.env"
            "$PROJECT_ROOT/.env.local"
            "$HOME/.env"
        )
    fi

    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            log_info "Loading environment from: $env_file"
            # Export variables, handling quotes and comments
            # Only export if not already set in environment (env vars take precedence)
            while IFS= read -r line || [[ -n "$line" ]]; do
                # Skip comments and empty lines
                [[ "$line" =~ ^[[:space:]]*# ]] && continue
                [[ -z "$line" ]] && continue

                # Extract variable name
                var_name="${line%%=*}"
                var_name="${var_name//[[:space:]]/}"

                # Skip if already set in environment
                if [ -z "${!var_name:-}" ]; then
                    # Remove surrounding quotes from value and export
                    eval "export $line" 2>/dev/null || true
                fi
            done < "$env_file"
            return 0
        fi
    done

    if [ -n "$ENV_FILE" ]; then
        log_err "Environment file not found: $ENV_FILE"
        exit 1
    fi

    log_warn "No .env file found, using environment variables only"
}

#######################################
# Validate configuration
#######################################
validate_config() {
    if [ -z "${DEPLOY_HOST:-}" ]; then
        log_err "DEPLOY_HOST is not set!"
        echo ""
        echo "Set it via:"
        echo "  1. Environment variable: DEPLOY_HOST=my-server.com $0"
        echo "  2. .env file: Add 'DEPLOY_HOST=my-server.com' to .env"
        echo ""
        exit 1
    fi

    DEPLOY_USER="${DEPLOY_USER:-ubuntu}"
    DEPLOY_PORT="${DEPLOY_PORT:-22}"
    ROOT_USER="${ROOT_USER:-root}"

    # Auto-detect ROOT_SSH_KEY if not set
    if [ -z "${ROOT_SSH_KEY:-}" ]; then
        # Try common key locations
        local key_candidates=(
            "$HOME/.ssh/ptcloud_root_id_ed25519"
            "$HOME/.ssh/id_ed25519"
            "$HOME/.ssh/id_rsa"
        )
        for key in "${key_candidates[@]}"; do
            if [ -f "$key" ]; then
                ROOT_SSH_KEY="$key"
                break
            fi
        done
    fi

    log_ok "Configuration:"
    log_info "  DEPLOY_HOST: $DEPLOY_HOST"
    log_info "  DEPLOY_USER: $DEPLOY_USER"
    log_info "  DEPLOY_PORT: $DEPLOY_PORT"
    log_info "  ROOT_USER:   $ROOT_USER (for initial setup)"
    log_info "  ROOT_SSH_KEY: ${ROOT_SSH_KEY:-auto}"
    log_info "  KEY_PATH:    $DEPLOY_KEY_PATH"
}

#######################################
# Test root SSH access
#######################################
test_root_access() {
    log_info "Testing root SSH access to $DEPLOY_HOST..."

    local ssh_opts=(-p "$DEPLOY_PORT" -o ConnectTimeout=10 -o BatchMode=yes)

    # Add identity file if specified
    if [ -n "${ROOT_SSH_KEY:-}" ] && [ -f "$ROOT_SSH_KEY" ]; then
        ssh_opts+=(-i "$ROOT_SSH_KEY")
    fi

    if ssh "${ssh_opts[@]}" "$ROOT_USER@$DEPLOY_HOST" "echo 'Root access OK'" 2>/dev/null; then
        log_ok "Root SSH access confirmed"
        return 0
    else
        log_err "Cannot connect as root to $DEPLOY_HOST"
        echo ""
        echo "Please ensure root SSH access is configured:"
        if [ -n "${ROOT_SSH_KEY:-}" ]; then
            echo "  ssh-copy-id -i ${ROOT_SSH_KEY}.pub -p $DEPLOY_PORT $ROOT_USER@$DEPLOY_HOST"
        else
            echo "  ssh-copy-id -p $DEPLOY_PORT $ROOT_USER@$DEPLOY_HOST"
        fi
        echo ""
        exit 1
    fi
}

#######################################
# Generate deploy key
#######################################
generate_key() {
    if [ -f "$DEPLOY_KEY_PATH" ]; then
        if [ "$FORCE_OVERWRITE" = true ]; then
            log_info "Overwriting existing key (--force)"
            rm -f "$DEPLOY_KEY_PATH" "$DEPLOY_KEY_PATH.pub"
        else
            log_warn "Deploy key already exists at: $DEPLOY_KEY_PATH"
            if [ "$AUTO_YES" = true ]; then
                log_info "Using existing key (--yes mode)"
                return 0
            fi
            echo ""
            read -p "Overwrite existing key? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Using existing key"
                return 0
            fi
            rm -f "$DEPLOY_KEY_PATH" "$DEPLOY_KEY_PATH.pub"
        fi
    fi

    log_info "Generating new deploy key..."
    mkdir -p "$(dirname "$DEPLOY_KEY_PATH")"
    ssh-keygen -t ed25519 -C "$DEPLOY_KEY_NAME" -f "$DEPLOY_KEY_PATH" -N ""
    chmod 600 "$DEPLOY_KEY_PATH"
    chmod 644 "$DEPLOY_KEY_PATH.pub"
    log_ok "Deploy key generated: $DEPLOY_KEY_PATH"
}

#######################################
# Setup ubuntu user on server
#######################################
setup_ubuntu_user() {
    log_info "Setting up $DEPLOY_USER user on $DEPLOY_HOST..."

    local pub_key
    pub_key=$(cat "$DEPLOY_KEY_PATH.pub")

    local ssh_opts=(-p "$DEPLOY_PORT")
    if [ -n "${ROOT_SSH_KEY:-}" ] && [ -f "$ROOT_SSH_KEY" ]; then
        ssh_opts+=(-i "$ROOT_SSH_KEY")
    fi

    ssh "${ssh_opts[@]}" "$ROOT_USER@$DEPLOY_HOST" bash -s << EOF
set -e

# Create .ssh directory
mkdir -p /home/$DEPLOY_USER/.ssh
chmod 700 /home/$DEPLOY_USER/.ssh

# Add deploy key to authorized_keys (avoid duplicates)
AUTH_FILE="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "\$AUTH_FILE"

if grep -q "$DEPLOY_KEY_NAME" "\$AUTH_FILE" 2>/dev/null; then
    echo "Key already exists, updating..."
    sed -i "/$DEPLOY_KEY_NAME/d" "\$AUTH_FILE"
fi

echo "$pub_key" >> "\$AUTH_FILE"

# Fix permissions
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
chmod 600 "\$AUTH_FILE"

# Ensure ubuntu user has passwordless sudo (for deployment scripts)
if [ ! -f /etc/sudoers.d/$DEPLOY_USER ]; then
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER
    chmod 440 /etc/sudoers.d/$DEPLOY_USER
    echo "Added passwordless sudo for $DEPLOY_USER"
fi

echo "Ubuntu user setup complete"
EOF

    log_ok "$DEPLOY_USER user configured on server"
}

#######################################
# Test deploy key access
#######################################
test_deploy_access() {
    log_info "Testing deploy key access..."

    if ssh -p "$DEPLOY_PORT" -i "$DEPLOY_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$DEPLOY_USER@$DEPLOY_HOST" "echo 'Deploy access OK'" 2>/dev/null; then
        log_ok "Deploy key access confirmed"
        return 0
    else
        log_err "Deploy key access failed"
        return 1
    fi
}

#######################################
# Setup repo deploy key (for private repos)
# This allows the server to clone/fetch from GitHub
#######################################
setup_repo_deploy_key() {
    if [ "$SKIP_REPO_KEY" = true ]; then
        log_info "Skipping repo deploy key setup (--skip-repo-key)"
        return 0
    fi

    # Auto-detect repo
    local repo="${GITHUB_REPO:-}"
    if [ -z "$repo" ]; then
        repo=$(git -C "$PROJECT_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/](.+)(\.git)?$|\1|' | sed 's/\.git$//')
    fi

    if [ -z "$repo" ]; then
        log_warn "Could not detect GitHub repo, skipping repo deploy key"
        return 0
    fi

    # Check if repo is private
    local is_private
    is_private=$(gh api "repos/$repo" --jq '.private' 2>/dev/null || echo "unknown")

    if [ "$is_private" = "false" ]; then
        log_info "Repository is public, repo deploy key not needed"
        return 0
    fi

    log_info "Setting up access for private repository: $repo"

    # Use PAT if requested
    if [ "$USE_PAT" = true ]; then
        setup_repo_with_pat "$repo"
        return $?
    fi

    # Try SSH key approach
    log_info "Trying SSH key approach..."

    # Check for existing GitHub SSH key first
    local github_key=""
    local github_key_candidates=(
        "$HOME/.ssh/github"
        "$HOME/.ssh/id_ed25519"
        "$HOME/.ssh/id_rsa"
    )

    for key in "${github_key_candidates[@]}"; do
        if [ -f "$key" ]; then
            # Test if this key works with GitHub (exit code 1 is OK - GitHub returns 1 for successful auth)
            local ssh_output
            ssh_output=$(ssh -i "$key" -o BatchMode=yes -o StrictHostKeyChecking=no -T git@github.com 2>&1 || true)
            if echo "$ssh_output" | grep -q "successfully authenticated"; then
                github_key="$key"
                log_ok "Found working GitHub SSH key: $key"
                break
            fi
        fi
    done

    if [ -n "$github_key" ]; then
        # Use existing GitHub key - pass it to the setup function
        log_info "Using existing GitHub SSH key instead of generating new one"
        setup_server_ssh_for_github "$github_key"
        return $?
    fi

    # Try to generate and add deploy key
    if [ -f "$REPO_DEPLOY_KEY_PATH" ]; then
        if [ "$FORCE_OVERWRITE" = true ]; then
            log_info "Overwriting existing repo deploy key (--force)"
            rm -f "$REPO_DEPLOY_KEY_PATH" "$REPO_DEPLOY_KEY_PATH.pub"
        else
            log_info "Using existing repo deploy key"
        fi
    fi

    if [ ! -f "$REPO_DEPLOY_KEY_PATH" ]; then
        log_info "Generating repo deploy key..."
        ssh-keygen -t ed25519 -C "$REPO_DEPLOY_KEY_NAME" -f "$REPO_DEPLOY_KEY_PATH" -N ""
        chmod 600 "$REPO_DEPLOY_KEY_PATH"
        chmod 644 "$REPO_DEPLOY_KEY_PATH.pub"
        log_ok "Repo deploy key generated: $REPO_DEPLOY_KEY_PATH"
    fi

    # Try to add deploy key to GitHub repo
    local pub_key
    pub_key=$(cat "$REPO_DEPLOY_KEY_PATH.pub")

    log_info "Adding deploy key to GitHub repository..."
    if gh api "repos/$repo/keys" -f title="Server Deploy Key ($(hostname))" -f key="$pub_key" -f read_only=true 2>/dev/null; then
        log_ok "Deploy key added to GitHub repository"
        setup_server_ssh_for_github "$REPO_DEPLOY_KEY_PATH"
        return $?
    else
        log_warn "Could not add deploy key to GitHub (deploy keys may be disabled)"
        log_info "Falling back to PAT method..."
        setup_repo_with_pat "$repo"
        return $?
    fi
}

#######################################
# Setup server SSH for GitHub access
#######################################
setup_server_ssh_for_github() {
    local key_to_copy="${1:-$REPO_DEPLOY_KEY_PATH}"

    log_info "Configuring server to use SSH for git operations..."
    log_info "Using key: $key_to_copy"

    local ssh_opts=(-p "$DEPLOY_PORT")
    local scp_opts=(-P "$DEPLOY_PORT")  # scp uses -P (capital) for port
    if [ -n "${ROOT_SSH_KEY:-}" ] && [ -f "$ROOT_SSH_KEY" ]; then
        ssh_opts+=(-i "$ROOT_SSH_KEY")
        scp_opts+=(-i "$ROOT_SSH_KEY")
    fi

    # Copy key to server
    local remote_key_path="/home/$DEPLOY_USER/.ssh/$REPO_DEPLOY_KEY_NAME"
    scp "${scp_opts[@]}" "$key_to_copy" "$ROOT_USER@$DEPLOY_HOST:$remote_key_path"

    ssh "${ssh_opts[@]}" "$ROOT_USER@$DEPLOY_HOST" bash -s << EOF
set -e

# Fix permissions
chown $DEPLOY_USER:$DEPLOY_USER $remote_key_path
chmod 600 $remote_key_path

# Configure SSH to use this key for github.com
SSH_CONFIG="/home/$DEPLOY_USER/.ssh/config"
touch "\$SSH_CONFIG"

if ! grep -q "Host github.com" "\$SSH_CONFIG" 2>/dev/null; then
    cat >> "\$SSH_CONFIG" << 'SSHEOF'

Host github.com
    HostName github.com
    User git
    IdentityFile $remote_key_path
    IdentitiesOnly yes
SSHEOF
fi

chown $DEPLOY_USER:$DEPLOY_USER "\$SSH_CONFIG"
chmod 600 "\$SSH_CONFIG"

# Add GitHub to known hosts
ssh-keyscan github.com >> /home/$DEPLOY_USER/.ssh/known_hosts 2>/dev/null || true
chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh/known_hosts

echo "Server SSH configured for GitHub access"
EOF

    log_ok "Server configured to access private GitHub repository via SSH"
}

#######################################
# Setup server with PAT for GitHub access
#######################################
setup_repo_with_pat() {
    local repo="$1"

    log_info "Setting up GitHub access using Personal Access Token..."

    # Get PAT from environment or prompt
    local pat="${GITHUB_PAT:-}"
    if [ -z "$pat" ]; then
        if [ "$AUTO_YES" = true ]; then
            log_err "GITHUB_PAT environment variable not set (required in --yes mode)"
            log_info "Set it via: GITHUB_PAT=ghp_xxxx $0 --use-pat --yes"
            return 1
        fi
        echo ""
        echo "Enter your GitHub Personal Access Token (PAT):"
        echo "  Create one at: https://github.com/settings/tokens"
        echo "  Required scopes: repo (for private repos)"
        echo ""
        read -s -p "PAT: " pat
        echo ""
    fi

    if [ -z "$pat" ]; then
        log_err "No PAT provided"
        return 1
    fi

    # Configure git on server to use PAT
    local ssh_opts=(-p "$DEPLOY_PORT")
    if [ -n "${ROOT_SSH_KEY:-}" ] && [ -f "$ROOT_SSH_KEY" ]; then
        ssh_opts+=(-i "$ROOT_SSH_KEY")
    fi

    log_info "Configuring server to use HTTPS with PAT for git operations..."

    ssh "${ssh_opts[@]}" "$ROOT_USER@$DEPLOY_HOST" bash -s << EOF
set -e

# Configure git credential helper to store credentials
sudo -u $DEPLOY_USER git config --global credential.helper store

# Store the PAT for github.com
CRED_FILE="/home/$DEPLOY_USER/.git-credentials"
echo "https://$pat@github.com" > "\$CRED_FILE"
chown $DEPLOY_USER:$DEPLOY_USER "\$CRED_FILE"
chmod 600 "\$CRED_FILE"

# Configure git to use HTTPS instead of SSH for github.com
sudo -u $DEPLOY_USER git config --global url."https://github.com/".insteadOf "git@github.com:"

echo "Server configured for GitHub HTTPS access with PAT"
EOF

    log_ok "Server configured to access private GitHub repository via PAT"
}

#######################################
# Show GitHub setup instructions
#######################################
show_github_instructions() {
    # Auto-detect repo from git remote if not set
    local repo="${GITHUB_REPO:-}"
    if [ -z "$repo" ]; then
        repo=$(git -C "$PROJECT_ROOT" remote get-url origin 2>/dev/null | sed -E 's|.*github\.com[:/](.+)(\.git)?$|\1|' | sed 's/\.git$//')
        if [ -z "$repo" ]; then
            log_warn "Could not detect GitHub repo from git remote"
            log_info "Set GITHUB_REPO environment variable or run from a git repository"
            return
        fi
        log_info "Detected repository: $repo"
    fi

    echo ""
    echo "========================================"
    echo "  GitHub Secrets Setup"
    echo "========================================"
    echo ""
    echo "Add these secrets to GitHub:"
    echo "  GitHub → Settings → Secrets and variables → Actions → New repository secret"
    echo ""
    echo "1. DEPLOY_HOST"
    echo "   Value: $DEPLOY_HOST"
    echo ""
    echo "2. PRODUCTION_SSH_KEY"
    echo "   Value: (contents of private key below)"
    echo ""
    echo "----------------------------------------"
    cat "$DEPLOY_KEY_PATH"
    echo "----------------------------------------"
    echo ""
    echo "Or use GitHub CLI:"
    echo ""
    echo "  gh secret set DEPLOY_HOST --body \"$DEPLOY_HOST\" --repo $repo"
    echo "  gh secret set PRODUCTION_SSH_KEY < \"$DEPLOY_KEY_PATH\" --repo $repo"
    echo ""

    # Offer to set secrets automatically
    if command -v gh &> /dev/null; then
        local do_set_secrets=false

        if [ "$AUTO_YES" = true ]; then
            do_set_secrets=true
            log_info "Setting GitHub secrets (--yes mode)..."
        else
            echo ""
            read -p "Set GitHub secrets now using 'gh' CLI? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                do_set_secrets=true
            fi
        fi

        if [ "$do_set_secrets" = true ]; then
            log_info "Setting DEPLOY_HOST secret..."
            if gh secret set DEPLOY_HOST --body "$DEPLOY_HOST" --repo "$repo" 2>/dev/null; then
                log_ok "DEPLOY_HOST secret set"
            else
                log_warn "Failed to set DEPLOY_HOST (may already exist or permission denied)"
            fi

            log_info "Setting PRODUCTION_SSH_KEY secret..."
            if gh secret set PRODUCTION_SSH_KEY < "$DEPLOY_KEY_PATH" --repo "$repo" 2>/dev/null; then
                log_ok "PRODUCTION_SSH_KEY secret set"
            else
                log_warn "Failed to set PRODUCTION_SSH_KEY (may already exist or permission denied)"
            fi

            echo ""
            log_ok "GitHub secrets configured!"
        fi
    else
        log_warn "GitHub CLI (gh) not found - set secrets manually"
    fi
}

#######################################
# Main
#######################################
main() {
    # Parse command line arguments
    parse_args "$@"

    echo ""
    echo "========================================"
    echo "  Deploy Key Setup"
    echo "========================================"
    echo ""

    # Load environment
    load_env

    # Validate configuration
    validate_config
    echo ""

    # Test root access
    test_root_access
    echo ""

    # Generate key
    generate_key
    echo ""

    # Setup ubuntu user on server
    setup_ubuntu_user
    echo ""

    # Test deploy access
    if test_deploy_access; then
        echo ""

        # Setup repo deploy key for private repos
        setup_repo_deploy_key
        echo ""

        show_github_instructions
        echo ""
        echo "========================================"
        echo "  Setup Complete!"
        echo "========================================"
        echo ""
        echo "You can now trigger deployment:"
        echo "  gh workflow run deploy-production.yml -f version=v0.2.0"
        echo ""
    else
        echo ""
        log_err "Setup failed - please check the errors above"
        exit 1
    fi
}

main "$@"
