# Deployment Automation

Automated deployment for `data-labeling` to production and preview environments.

## Prerequisites

### 1. Configure `.env` file

Add deployment settings to your `.env` file:

```bash
# Server hostname/IP for deployment
DEPLOY_HOST="your-server.example.com"

# GitHub Personal Access Token (required for PRIVATE repos)
# Create at: https://github.com/settings/tokens (scopes: repo)
GITHUB_PAT="ghp_xxxxxxxxxxxxxxxxxxxx"
```

### 2. Configure GitHub Repository Secrets

Go to **GitHub → Settings → Secrets and variables → Actions → Secrets** and add:

| Secret | Description | Example |
|--------|-------------|---------|
| `DEPLOY_HOST` | Server IP or hostname | `my-server.example.com` |
| `PRODUCTION_SSH_KEY` | SSH private key | Contents of `~/.ssh/github-actions-deploy` |

### 3. Run Setup Script

**Automated setup** (recommended):
```bash
# For PRIVATE repos (uses GITHUB_PAT from .env)
./bin/setup-deploy-key.sh --use-pat --yes

# For PUBLIC repos (no PAT needed)
./bin/setup-deploy-key.sh --yes

# Use specific env file
./bin/setup-deploy-key.sh --env-file .env.production --use-pat --yes

# Show help
./bin/setup-deploy-key.sh --help
```

This script will:
1. Load `DEPLOY_HOST` and `GITHUB_PAT` from `.env` file
2. Generate a dedicated deploy key (`~/.ssh/github-actions-deploy`) for GitHub Actions → Server
3. Configure server to access private GitHub repo (using PAT)
4. Set GitHub secrets (`DEPLOY_HOST`, `PRODUCTION_SSH_KEY`) via `gh` CLI

**Manual CLI setup**:
```bash
gh secret set DEPLOY_HOST --body "my-server.example.com" --repo ptdevhk/data-labeling
gh secret set PRODUCTION_SSH_KEY < ~/.ssh/deploy_key --repo ptdevhk/data-labeling
```

## Quick Start

Replace `your-server.example.com` with your actual server hostname/IP.

### One-time Deploy Key Setup (from local machine)
```bash
# Requires root SSH access to production server
DEPLOY_HOST=your-server.example.com ./bin/setup-deploy-key.sh
```

### One-time Server Setup (installs Node.js, bun, clones repo)
```bash
ssh ubuntu@your-server.example.com 'bash -s' < bin/setup-server-deploy.sh
```

### Daily Production Update (checks for new version, deploys if available)
```bash
ssh ubuntu@your-server.example.com "/home/ubuntu/data-labeling/bin/deploy-production.sh update"
```

### Check Status
```bash
ssh ubuntu@your-server.example.com "/home/ubuntu/data-labeling/bin/deploy-production.sh status"
```

### Testing on Local VM (ubuntu01.lan)

**Prerequisites:** Root SSH access configured with `ssh-copy-id -i ~/.ssh/ptcloud_root_id_ed25519.pub root@ubuntu01.lan`

```bash
# 1. Setup SSH for ubuntu user (one-time)
ssh root@ubuntu01.lan 'bash -s' << 'EOF'
mkdir -p /home/ubuntu/.ssh
cp /root/.ssh/authorized_keys /home/ubuntu/.ssh/
chown -R ubuntu:ubuntu /home/ubuntu/.ssh
chmod 700 /home/ubuntu/.ssh
chmod 600 /home/ubuntu/.ssh/authorized_keys
echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/ubuntu
chmod 440 /etc/sudoers.d/ubuntu
EOF

# 2. Fix VM time sync (important for apt-get)
ssh ubuntu@ubuntu01.lan 'sudo timedatectl set-ntp true && sudo systemctl restart systemd-timesyncd'

# 3. Run server setup (installs Node.js 20, bun, clones repo, creates directories)
ssh ubuntu@ubuntu01.lan 'bash -s' < bin/setup-server-deploy.sh

# 4. Copy deployment scripts (if not yet in git)
scp bin/deploy-production.sh bin/deploy-preview.sh ubuntu@ubuntu01.lan:/home/ubuntu/data-labeling/bin/
ssh ubuntu@ubuntu01.lan 'chmod +x /home/ubuntu/data-labeling/bin/*.sh'

# 5. Deploy production (PORT_BIND=0.0.0.0 for external access without system Caddy)
ssh ubuntu@ubuntu01.lan 'sg docker -c "PORT_BIND=0.0.0.0 /home/ubuntu/data-labeling/bin/deploy-production.sh v0.2.0"'

# 6. Test preview deployment
CURRENT_SHA=$(ssh ubuntu@ubuntu01.lan 'cd /home/ubuntu/data-labeling && git rev-parse HEAD')
ssh ubuntu@ubuntu01.lan "sg docker -c 'PORT_BIND=0.0.0.0 /home/ubuntu/data-labeling/bin/deploy-preview.sh deploy test-preview $CURRENT_SHA ptdevhk/data-labeling'"

# 7. Verify
curl http://ubuntu01.lan:5002/health  # Production
curl http://ubuntu01.lan:4173/health  # Preview
# Open http://ubuntu01.lan:5002 and http://ubuntu01.lan:4173 in browser
```

**Troubleshooting:**

| Issue | Solution |
|-------|----------|
| `apt-get` fails with "Release file not valid yet" | Fix VM time: `sudo timedatectl set-ntp true` |
| `bun: command not found` | Source shell: `source ~/.bashrc` or use full path `~/.bun/bin/bun` |
| `node: command not found` | Reinstall: `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| Port not accessible | Use `PORT_BIND=0.0.0.0` for external access |
| Docker permission denied | Use `sg docker -c "command"` or re-login after adding to docker group |

---

## Overview

| Environment | Domain | Port | Trigger |
|-------------|--------|------|---------|
| **Production** | `labeling.pt-mes.com` | 5002 | GitHub Release or `update` command |
| **Preview** | `preview.pt-mes.com` | 4173 | PR/branch push (single slot) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                                │
│  ┌─────────────────┐           ┌─────────────────┐                  │
│  │ deploy-production│           │  deploy-preview │                  │
│  │      .yml       │           │ continue-on-error│                  │
│  └────────┬────────┘           └────────┬────────┘                  │
│           │ scp + ssh                   │ scp + ssh                  │
│           ▼                             ▼                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Production Server (DEPLOY_HOST)                     │
│                                                                      │
│  Caddy (System):                                                     │
│    labeling.pt-mes.com → localhost:5002                              │
│    preview.pt-mes.com  → localhost:4173                              │
│                                                                      │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐ │
│  │  Production              │  │  Preview (Single Slot)           │ │
│  │  /home/ubuntu/           │  │  /home/ubuntu/                   │ │
│  │    data-labeling/        │  │    data-labeling-preview/        │ │
│  │  port 5002               │  │  port 4173                       │ │
│  └──────────────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Commands Reference

### Production (`bin/deploy-production.sh`)

| Command | Description |
|---------|-------------|
| `status` | Show current version, health, available updates |
| `update` | Check for updates → deploy if new version available |
| `v1.2.3` | Deploy specific version |
| `v1.2.3 rollback` | Deploy with auto-rollback on failure |

**Examples:**
```bash
# Check status
./bin/deploy-production.sh status

# Daily update check (safe - skips if no updates)
./bin/deploy-production.sh update

# Deploy specific version
./bin/deploy-production.sh v1.2.3

# Deploy with rollback protection
./bin/deploy-production.sh v1.2.3 rollback
```

### Preview (`bin/deploy-preview.sh`)

| Command | Description |
|---------|-------------|
| `status` | Show current preview deployment |
| `cleanup` | Stop and clean preview |
| `deploy <name> <sha> <repo>` | Deploy preview |

## Setup

### 1. Run Server Setup (One-time)

```bash
ssh ubuntu@your-server.example.com 'bash -s' < bin/setup-server-deploy.sh
```

This will:
- Check/install Node.js 18+ (required for TypeScript)
- Install bun (via npm or curl fallback)
- Create directories (`/home/ubuntu/data-labeling-preview`, `/home/ubuntu/backups`, `/home/ubuntu/logs`)
- Add user to docker group if needed
- Clone repo if not exists
- Create `.env` from `.env.example` with generated secret key
- Verify Caddy configuration
- Setup log rotation

### 2. Configure GitHub Secrets and Variables

Navigate to **GitHub → Repository → Settings → Secrets and variables → Actions**

#### Required Secrets

| Secret | Description | How to Get |
|--------|-------------|------------|
| `DEPLOY_HOST` | Server IP or hostname | Your server address |
| `PRODUCTION_SSH_KEY` | SSH private key for server access | `cat ~/.ssh/your_key_id_ed25519` |

#### Optional Repository Variables

These have sensible defaults but can be customized:

| Variable | Default | Description |
|----------|---------|-------------|
| `DEPLOY_PORT` | `22` | SSH port number |
| `DEPLOY_USER` | `ubuntu` | SSH username |
| `DEPLOY_PATH` | `/home/ubuntu/data-labeling` | Production deployment path |
| `PRODUCTION_URL` | `https://labeling.pt-mes.com` | Production URL for notifications |
| `HEALTH_CHECK_URL` | `http://localhost:5002/health` | Health check endpoint |
| `PREVIEW_URL` | `https://preview.pt-mes.com` | Preview URL for PR comments |
| `PREVIEW_PORT` | `4173` | Preview container port |
| `PREVIEW_PATH` | `/home/ubuntu/data-labeling-preview` | Preview deployment path |
| `PORT_BIND` | `127.0.0.1` | IP binding (`0.0.0.0` for external access) |

#### Example: Custom Server Setup

```yaml
# For a server with non-standard SSH port
DEPLOY_HOST: my-server.example.com
DEPLOY_PORT: 2222
DEPLOY_USER: deploy

# For external access without system Caddy
PORT_BIND: 0.0.0.0
```

#### Generating SSH Key

```bash
# Generate a new key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# Copy public key to server
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@your-server.com

# Get private key for GitHub secret
cat ~/.ssh/deploy_key
```

### 3. (Optional) Setup Daily Cron

```bash
ssh ubuntu@your-server.example.com
crontab -e

# Add this line (runs at 4 AM daily):
0 4 * * * /home/ubuntu/data-labeling/bin/deploy-production.sh update >> /home/ubuntu/logs/cron.log 2>&1
```

## Deployment Flows

### Production: GitHub Release
```
Create Release → deploy-production.yml → SSH → deploy-production.sh v1.2.3
```

### Production: Manual Update Check
```
./deploy-production.sh update
  ├─ Fetch latest tags
  ├─ Compare with current version
  ├─ No updates? → Exit (no action)
  └─ New version? → Deploy → Health check → Done
```

### Preview: PR/Branch Push
```
PR opened → deploy-preview.yml → SSH → deploy-preview.sh deploy pr-123 sha repo
  ├─ Success → Comment with URL
  └─ Failure → Comment with warning (doesn't block PR)
```

## Resilience

### Production
- **Auto-rollback**: Reverts to previous version if health check fails
- **Backup**: Creates backup before each deploy
- **Skip if current**: `update` command exits cleanly if already on latest
- **Disk space check**: Aborts if <1GB free (prevents mid-deploy failures)
- **Deployment timing**: Logs duration for performance tracking
- **Deployment lock**: Prevents concurrent deployments with stale lock detection (30 min timeout)
- **Git fetch retry**: Retries 3 times with exponential backoff on network failures
- **Dirty state handling**: Auto-stashes uncommitted changes before checkout
- **Docker group handling**: Auto-detects and uses `sg docker` when needed

### Preview
- **Non-blocking**: `continue-on-error: true` - never blocks PRs
- **Graceful skip**: Works without SSH key configured
- **Single slot**: Latest deploy overwrites previous (no cleanup needed)
- **Disk space check**: Aborts if <500MB free
- **Secret key generation**: Each preview gets unique API_SECRET_KEY
- **Container log output**: Shows logs on health check failure for debugging
- **Git fetch retry**: Retries 3 times with exponential backoff on network failures
- **Dirty state handling**: Auto-resets uncommitted changes before checkout
- **Docker group handling**: Auto-detects and uses `sg docker` when needed

### SSH Connection Management
- **Connection Multiplexing**: Uses SSH `ControlMaster` to reuse a single TCP connection
- **Concurrency Groups**: Only one production deploy and one preview deploy at a time
- **Connection Cleanup**: Master connections gracefully closed after each workflow
- **Keepalive**: `ServerAliveInterval` prevents stale connections

| Feature | Production | Preview |
|---------|------------|---------|
| `ControlPersist` | 300s | 60s |
| `ConnectTimeout` | 30s | 15s |
| Concurrency | Queue (don't cancel) | Cancel old |

## Troubleshooting

Replace `your-server.example.com` with your actual server hostname/IP.

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Permission denied (publickey)` in GitHub Actions | SSH key secret corrupted or not set | Re-upload: `gh secret set PRODUCTION_SSH_KEY < ~/.ssh/github-actions-deploy` |
| SSH works locally but fails in Actions | GitHub secret encoding issue | Re-run `./bin/setup-deploy-key.sh --yes` |
| `DEPLOY_HOST secret is not set` | Secret not configured | Set secret: `gh secret set DEPLOY_HOST --body "your-server.com"` |
| Deployment succeeds but site not accessible | Caddy not configured | Check `/etc/caddy/Caddyfile` has domain configured |
| Health check fails | Container not started | Check logs: `docker compose logs` |

### SSH Key Issues

If GitHub Actions fails with `Permission denied (publickey)`:

```bash
# 1. Test key locally first
ssh -i ~/.ssh/github-actions-deploy ubuntu@your-server.example.com "echo OK"

# 2. If local works but Actions fails, re-upload the secret:
gh secret set PRODUCTION_SSH_KEY < ~/.ssh/github-actions-deploy --repo ptdevhk/data-labeling

# 3. If local also fails, re-run full setup:
./bin/setup-deploy-key.sh --yes
```

### Debugging Commands

```bash
# Check production status
ssh ubuntu@your-server.example.com "/home/ubuntu/data-labeling/bin/deploy-production.sh status"

# View logs
ssh ubuntu@your-server.example.com "tail -100 /home/ubuntu/logs/deploy-*.log"

# Manual health check
ssh ubuntu@your-server.example.com "curl -v http://localhost:5002/health"

# Check containers
ssh ubuntu@your-server.example.com "docker ps"
```

## Configuration

### GitHub Actions Variables vs Script Environment Variables

The deployment system has two configuration layers:

1. **GitHub Actions Variables** (configured in GitHub UI)
   - Used when running workflows via GitHub Actions
   - Set in **GitHub → Settings → Secrets and variables → Actions**
   - See [Configure GitHub Secrets and Variables](#2-configure-github-secrets-and-variables)

2. **Script Environment Variables** (set at runtime)
   - Used when running scripts directly via SSH
   - Override defaults by prefixing commands

### Script Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PRODUCTION_DOMAIN` | `labeling.pt-mes.com` | Production domain name |
| `PREVIEW_DOMAIN` | `preview.pt-mes.com` | Preview domain name |
| `PRODUCTION_PORT` | `5002` | Production container port |
| `PREVIEW_PORT` | `4173` | Preview container port |
| `DEPLOY_PATH` | `/home/ubuntu/data-labeling` | Production deployment path |
| `PREVIEW_PATH` | `/home/ubuntu/data-labeling-preview` | Preview deployment path |
| `BACKUP_DIR` | `/home/ubuntu/backups/data-labeling` | Backup directory |
| `LOG_DIR` | `/home/ubuntu/logs` | Log directory |
| `REPO_URL` | `https://github.com/ptdevhk/data-labeling.git` | Git repository URL |
| `HEALTH_CHECK_RETRIES` | `5` | Health check retry attempts |
| `HEALTH_CHECK_DELAY` | `3` | Seconds between health checks |
| `PORT_BIND` | `127.0.0.1` | IP to bind ports (`0.0.0.0` for external access) |

### Custom Domain Example

```bash
# Deploy to a different domain
PRODUCTION_DOMAIN=myapp.example.com PRODUCTION_PORT=8080 \
  ./bin/deploy-production.sh v1.2.3

# Setup with custom configuration
PRODUCTION_DOMAIN=myapp.example.com PREVIEW_DOMAIN=preview.example.com \
  bash -s < bin/setup-server-deploy.sh
```

## Files

```
bin/
├── setup-deploy-key.sh      # Generate deploy key + configure GitHub secrets
├── setup-server-deploy.sh   # One-time server setup (Node.js, bun, repo clone)
├── deploy-production.sh     # Production: status, update, deploy
└── deploy-preview.sh        # Preview: status, cleanup, deploy

.github/workflows/
├── deploy-production.yml    # On release → deploy
└── deploy-preview.yml       # On PR → preview (non-blocking)

dockerfiles/
└── python313/Dockerfile     # Uses docker.io/astral/uv for faster pulls
```
