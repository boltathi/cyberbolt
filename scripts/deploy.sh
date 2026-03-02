#!/bin/bash
set -euo pipefail

# CyberBolt Deployment Script for Contabo VPS
# Usage: bash scripts/deploy.sh

DOMAIN="cyberbolt.in"
APP_DIR="/opt/cyberbolt"
REPO_URL="https://github.com/YOUR_USERNAME/cyberbolt.git"

echo "🔒 CyberBolt Deployment Script"
echo "================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose plugin if not present
if ! docker compose version &> /dev/null; then
    echo "🐳 Installing Docker Compose plugin..."
    apt-get install -y docker-compose-plugin
fi

# Install additional tools
apt-get install -y git curl ufw fail2ban

# Configure firewall
echo "🔥 Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
echo "🛡️ Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Clone or pull repository
if [ -d "$APP_DIR" ]; then
    echo "📥 Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your production values!"
    echo "   nano $APP_DIR/.env"
    echo ""
    echo "Required changes:"
    echo "  - FLASK_ENV=production"
    echo "  - SECRET_KEY=<generate with: python3 -c \"import secrets; print(secrets.token_hex(32))\">"
    echo "  - JWT_SECRET_KEY=<generate with: python3 -c \"import secrets; print(secrets.token_hex(32))\">"
    echo "  - ADMIN_PASSWORD=<strong password>"
    echo ""
    read -p "Press Enter after editing .env to continue..."
fi

# Create data directory
mkdir -p data

# Build and start
echo "🏗️ Building containers..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🔍 Running health checks..."
if curl -s http://localhost/api/v1/health | grep -q "healthy"; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed"
    docker compose logs backend
fi

if curl -s http://localhost/nginx-health | grep -q "OK"; then
    echo "✅ Nginx is healthy!"
else
    echo "❌ Nginx health check failed"
fi

echo ""
echo "================================"
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "  1. Point DNS A record for $DOMAIN to this server's IP"
echo "  2. Run: bash scripts/setup-ssl.sh"
echo "  3. Visit: http://$DOMAIN"
echo "  4. Admin: http://$DOMAIN/admin"
echo "================================"
