#!/bin/bash
# One-time server setup for deployment automation
#
# Run remotely:
#   curl -fsSL https://raw.githubusercontent.com/ptdevhk/data-labeling/main/bin/setup-server-deploy.sh | bash
#
# Or via SSH (replace your-server.example.com with your server hostname/IP):
#   ssh ubuntu@your-server.example.com 'bash -s' < bin/setup-server-deploy.sh

set -euo pipefail

#######################################
# Configuration (can be overridden via environment variables)
#######################################
PRODUCTION_PATH="${PRODUCTION_PATH:-/home/ubuntu/data-labeling}"
PREVIEW_PATH="${PREVIEW_PATH:-/home/ubuntu/data-labeling-preview}"
BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/backups/data-labeling}"
LOG_DIR="${LOG_DIR:-/home/ubuntu/logs}"
# SSH URL for private repos, HTTPS for public repos
# Override with REPO_URL environment variable if needed
REPO_URL="${REPO_URL:-git@github.com:ptdevhk/data-labeling.git}"
REPO_URL_HTTPS="${REPO_URL_HTTPS:-https://github.com/ptdevhk/data-labeling.git}"
PRODUCTION_DOMAIN="${PRODUCTION_DOMAIN:-labeling.pt-mes.com}"
PREVIEW_DOMAIN="${PREVIEW_DOMAIN:-preview.pt-mes.com}"
PRODUCTION_PORT="${PRODUCTION_PORT:-5002}"
PREVIEW_PORT="${PREVIEW_PORT:-4173}"

#######################################
# Colors (if terminal supports)
#######################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_ok() { echo -e "${GREEN}✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*"; }
log_err() { echo -e "${RED}✗${NC} $*"; }
log_info() { echo "  $*"; }

#######################################
# Main
#######################################
echo ""
echo "======================================"
echo "  Data Labeling - Server Setup"
echo "======================================"
echo ""

# 1. Create directories
echo "Creating directories..."
mkdir -p "$PREVIEW_PATH" "$BACKUP_DIR" "$LOG_DIR"
log_ok "Directories created"

# 2. Check/install Node.js (need 18+ for TypeScript)
echo "Checking Node.js..."
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [ "$NODE_VERSION" -ge 18 ]; then
    log_ok "Node.js installed: $(node --version)"
else
    log_warn "Node.js $NODE_VERSION is too old (need 18+)"
    log_info "Installing Node.js 20 via NodeSource..."

    # Remove old conflicting packages that may block installation
    sudo apt-get remove -y libnode-dev nodejs npm 2>/dev/null || true
    sudo apt-get autoremove -y 2>/dev/null || true

    # Install prerequisites
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg

    # Install Node.js 20 via NodeSource (official method)
    # The setup script must be piped to 'sudo -E bash -' to work correctly
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs

    # Verify installation
    NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
    if [ "$NODE_VERSION" -ge 18 ]; then
        log_ok "Node.js installed: $(node --version)"
    else
        log_err "Failed to install Node.js 18+."
        log_info "Manual fix: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
fi

# 3. Check/install bun
echo "Checking bun..."
export PATH="$HOME/.bun/bin:/usr/local/bin:$PATH"
if command -v bun &> /dev/null; then
    log_ok "Bun installed: $(bun --version)"
else
    echo "Installing bun..."
    # Ensure unzip is installed (required for curl installer)
    sudo apt-get install -y unzip 2>/dev/null || true

    # Install bun via curl (recommended method)
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"

    # Create system-wide symlink so bun works in non-interactive shells
    if [ -f "$HOME/.bun/bin/bun" ]; then
        sudo ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
        log_ok "Bun installed: $(bun --version) (symlinked to /usr/local/bin)"
    else
        log_err "Bun installation failed"
        exit 1
    fi
fi

# 4. Check docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    log_ok "Docker installed: $(docker --version | cut -d' ' -f3 | tr -d ',')"
else
    log_err "Docker not installed!"
    log_info "Install with: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if docker compose version &> /dev/null; then
    log_ok "Docker Compose installed"
else
    log_err "Docker Compose not available"
    exit 1
fi

# Check if user is in docker group
if groups | grep -q docker; then
    log_ok "User is in docker group"
else
    log_warn "User not in docker group - adding..."
    sudo usermod -aG docker "$USER"
    log_ok "Added to docker group (re-login or use 'sg docker' for new session)"
fi

# 5. Check/clone production repo
echo "Checking production repository..."
if [ -d "$PRODUCTION_PATH/.git" ]; then
    log_ok "Production repo exists at $PRODUCTION_PATH"
else
    log_warn "Production repo not found"
    echo "Cloning repository..."
    # Try SSH first (for private repos), fall back to HTTPS (for public repos)
    if git clone "$REPO_URL" "$PRODUCTION_PATH" 2>&1; then
        log_ok "Repository cloned via SSH"
    elif git clone "$REPO_URL_HTTPS" "$PRODUCTION_PATH" 2>&1; then
        log_ok "Repository cloned via HTTPS"
    else
        log_err "Failed to clone repository"
        log_info "For private repos, run bin/setup-deploy-key.sh first to configure SSH access"
        exit 1
    fi
fi

# 6. Setup .env file
echo "Checking .env file..."
if [ -f "$PRODUCTION_PATH/.env" ]; then
    log_ok ".env file exists"
else
    if [ -f "$PRODUCTION_PATH/.env.example" ]; then
        cp "$PRODUCTION_PATH/.env.example" "$PRODUCTION_PATH/.env"
        # Generate a new secret key
        NEW_SECRET=$(openssl rand -hex 32)
        sed -i "s/API_SECRET_KEY=.*/API_SECRET_KEY=\"$NEW_SECRET\"/" "$PRODUCTION_PATH/.env"
        log_ok ".env created from .env.example with new secret key"
    else
        log_warn ".env.example not found - create .env manually"
    fi
fi

# 7. Check Caddy config
echo "Checking Caddy configuration..."
if [ -f /etc/caddy/Caddyfile ]; then
    if grep -q "$PRODUCTION_DOMAIN" /etc/caddy/Caddyfile; then
        log_ok "$PRODUCTION_DOMAIN configured"
    else
        log_warn "$PRODUCTION_DOMAIN not in Caddyfile"
    fi

    if grep -q "$PREVIEW_DOMAIN" /etc/caddy/Caddyfile; then
        log_ok "$PREVIEW_DOMAIN configured"
    else
        log_warn "$PREVIEW_DOMAIN not in Caddyfile"
        log_info "Add to /etc/caddy/Caddyfile:"
        log_info ""
        log_info "  $PREVIEW_DOMAIN {"
        log_info "      reverse_proxy localhost:$PREVIEW_PORT"
        log_info "      tls leotse@datadigitalisation.com"
        log_info "  }"
    fi
else
    log_warn "Caddyfile not found at /etc/caddy/Caddyfile"
fi

# 8. Setup log rotation
echo "Setting up log rotation..."
sudo tee /etc/logrotate.d/deploy-logs > /dev/null << 'EOF'
/home/ubuntu/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 644 ubuntu ubuntu
}
EOF
log_ok "Log rotation configured"

# 9. Summary
echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Server layout:"
echo "  Production: $PRODUCTION_PATH → ${PRODUCTION_DOMAIN}:${PRODUCTION_PORT}"
echo "  Preview:    $PREVIEW_PATH → ${PREVIEW_DOMAIN}:${PREVIEW_PORT}"
echo "  Backups:    $BACKUP_DIR"
echo "  Logs:       $LOG_DIR"
echo ""
echo "Next steps:"
echo ""
echo "1. If docker group was added, apply it:"
echo "   newgrp docker  # or re-login"
echo ""
echo "2. Add GitHub secret 'PRODUCTION_SSH_KEY':"
echo "   cat ~/.ssh/ptcloud_root_id_ed25519"
echo "   → Paste to: GitHub → Settings → Secrets → Actions"
echo ""
echo "3. Test deployment commands:"
echo "   $PRODUCTION_PATH/bin/deploy-production.sh status"
echo "   $PRODUCTION_PATH/bin/deploy-production.sh update"
echo ""
echo "4. (Optional) Add cron for daily updates:"
echo "   crontab -e"
echo "   0 4 * * * $PRODUCTION_PATH/bin/deploy-production.sh update >> $LOG_DIR/cron.log 2>&1"
echo ""
