#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Kwik VPS Setup Script
# ═══════════════════════════════════════════════════════════════════════════
#
# This script sets up a fresh VPS for Kwik deployment.
# Run as root on a fresh Ubuntu/Debian server.
#
# Usage:
#   curl -sSL https://raw.githubusercontent.com/kwikgg/kw-core/main/scripts/setup-vps.sh | sudo bash
#
# Or download and run:
#   wget https://raw.githubusercontent.com/kwikgg/kw-core/main/scripts/setup-vps.sh
#   chmod +x setup-vps.sh
#   sudo ./setup-vps.sh
#
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ─────────────────────────────────────────────────────────────
# Prerequisites check
# ─────────────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
  log_error "This script must be run as root"
  exit 1
fi

log_info "Starting Kwik VPS setup..."

# ─────────────────────────────────────────────────────────────
# System updates
# ─────────────────────────────────────────────────────────────
log_info "Updating system packages..."
apt-get update
apt-get upgrade -y

# ─────────────────────────────────────────────────────────────
# Install Docker
# ─────────────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  log_info "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
else
  log_info "Docker already installed"
fi

# ─────────────────────────────────────────────────────────────
# Install Node.js 20
# ─────────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
  log_info "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  log_info "Node.js already installed: $(node --version)"
fi

# ─────────────────────────────────────────────────────────────
# Install pnpm
# ─────────────────────────────────────────────────────────────
if ! command -v pnpm &> /dev/null; then
  log_info "Installing pnpm..."
  npm install -g pnpm
else
  log_info "pnpm already installed: $(pnpm --version)"
fi

# ─────────────────────────────────────────────────────────────
# Create deploy user
# ─────────────────────────────────────────────────────────────
DEPLOY_USER="kwikdeploy"

if id "$DEPLOY_USER" &>/dev/null; then
  log_info "User $DEPLOY_USER already exists"
else
  log_info "Creating deploy user: $DEPLOY_USER"
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
  
  # Generate random password (user can change later)
  TEMP_PASS=$(openssl rand -base64 16)
  echo "$DEPLOY_USER:$TEMP_PASS" | chpasswd
  log_warn "Temporary password for $DEPLOY_USER: $TEMP_PASS"
  log_warn "Please change this password immediately!"
fi

# Add to docker group
usermod -aG docker "$DEPLOY_USER"

# ─────────────────────────────────────────────────────────────
# Create directory structure
# ─────────────────────────────────────────────────────────────
log_info "Creating directory structure..."

mkdir -p /opt/kwik/{releases,shared,_work}
mkdir -p /var/log/kwik

chown -R "$DEPLOY_USER:$DEPLOY_USER" /opt/kwik
chown -R "$DEPLOY_USER:$DEPLOY_USER" /var/log/kwik

# ─────────────────────────────────────────────────────────────
# Create sudoers rule for passwordless service restart
# ─────────────────────────────────────────────────────────────
log_info "Configuring sudo permissions..."

cat > /etc/sudoers.d/kwikdeploy << 'EOF'
# Allow kwikdeploy to manage the kwik service without password
kwikdeploy ALL=(root) NOPASSWD: /bin/systemctl start kwik
kwikdeploy ALL=(root) NOPASSWD: /bin/systemctl stop kwik
kwikdeploy ALL=(root) NOPASSWD: /bin/systemctl restart kwik
kwikdeploy ALL=(root) NOPASSWD: /bin/systemctl status kwik
kwikdeploy ALL=(root) NOPASSWD: /bin/systemctl reload kwik
EOF

chmod 440 /etc/sudoers.d/kwikdeploy
visudo -c

# ─────────────────────────────────────────────────────────────
# Create systemd service for Kwik app
# ─────────────────────────────────────────────────────────────
log_info "Creating systemd service..."

cat > /etc/systemd/system/kwik.service << 'EOF'
[Unit]
Description=Kwik Application
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=kwikdeploy
Group=kwikdeploy
WorkingDirectory=/opt/kwik/current
ExecStart=/usr/bin/node /opt/kwik/current/server.js
Restart=always
RestartSec=5

# Environment
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0

# Load environment from shared .env
EnvironmentFile=-/opt/kwik/shared/.env

# Security
NoNewPrivileges=true
PrivateTmp=true

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=kwik

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kwik

# ─────────────────────────────────────────────────────────────
# Create template .env file
# ─────────────────────────────────────────────────────────────
log_info "Creating template environment file..."

cat > /opt/kwik/shared/.env << 'EOF'
# Kwik Production Environment
# Edit these values before first deployment!

NODE_ENV=production
PORT=3000

# Redis (runs in Docker, accessible via localhost)
REDIS_URL=redis://localhost:6379

# MinIO S3-compatible storage (runs in Docker)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=CHANGE_THIS_IN_PRODUCTION
S3_BUCKET_NAME=kwik-files

# Application URL (change to your domain)
NEXT_PUBLIC_APP_URL=https://kwik.gg

# File limits
MAX_FILE_SIZE=104857600
MAX_EXPIRY_SECONDS=604800
EOF

chown "$DEPLOY_USER:$DEPLOY_USER" /opt/kwik/shared/.env
chmod 600 /opt/kwik/shared/.env

# ─────────────────────────────────────────────────────────────
# Create Docker Compose file for services
# ─────────────────────────────────────────────────────────────
log_info "Creating Docker Compose for services..."

cat > /opt/kwik/shared/docker-compose.yml << 'EOF'
services:
  redis:
    image: redis:7-alpine
    container_name: kwik-redis
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  minio:
    image: minio/minio:latest
    container_name: kwik-minio
    ports:
      - "127.0.0.1:9000:9000"
      - "127.0.0.1:9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always

  minio-init:
    image: minio/mc:latest
    container_name: kwik-minio-init
    depends_on:
      minio:
        condition: service_healthy
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 minioadmin $${MINIO_ROOT_PASSWORD:-minioadmin};
      mc mb local/kwik-files --ignore-existing;
      exit 0;
      "
    restart: "no"

volumes:
  redis_data:
    name: kwik-redis-data
  minio_data:
    name: kwik-minio-data
EOF

chown "$DEPLOY_USER:$DEPLOY_USER" /opt/kwik/shared/docker-compose.yml

# ─────────────────────────────────────────────────────────────
# Start Docker services
# ─────────────────────────────────────────────────────────────
log_info "Starting Docker services..."

cd /opt/kwik/shared
docker compose up -d

# ─────────────────────────────────────────────────────────────
# Print next steps
# ─────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}VPS Setup Complete!${NC}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit the environment file:"
echo "   sudo nano /opt/kwik/shared/.env"
echo "   - Change MINIO_ROOT_PASSWORD"
echo "   - Update NEXT_PUBLIC_APP_URL if needed"
echo ""
echo "2. Install GitHub Actions runner as kwikdeploy:"
echo "   su - kwikdeploy"
echo "   mkdir -p ~/actions-runner && cd ~/actions-runner"
echo "   # Download runner from GitHub repo settings"
echo "   # Configure with: ./config.sh --url https://github.com/YOUR_ORG/kw-core --token YOUR_TOKEN"
echo ""
echo "3. Create runner systemd service (as root):"
cat << 'RUNNER_SERVICE'

cat > /etc/systemd/system/github-runner-kwik.service << 'SVC'
[Unit]
Description=GitHub Actions Runner for Kwik
After=network.target

[Service]
Type=simple
User=kwikdeploy
Group=kwikdeploy
WorkingDirectory=/home/kwikdeploy/actions-runner
ExecStart=/home/kwikdeploy/actions-runner/run.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SVC

systemctl daemon-reload
systemctl enable github-runner-kwik
systemctl start github-runner-kwik

RUNNER_SERVICE
echo ""
echo "4. Configure nginx (if needed) as reverse proxy to localhost:3000"
echo ""
echo "5. Push to main branch to trigger first deployment!"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
