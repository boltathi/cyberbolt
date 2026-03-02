#!/bin/bash
set -euo pipefail

# SSL Setup Script for CyberBolt
# Requires: DNS already pointing to this server

DOMAIN="cyberbolt.in"
EMAIL="admin@cyberbolt.in"

echo "🔐 CyberBolt SSL Setup"
echo "======================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (sudo)"
    exit 1
fi

# Install certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    apt-get install -y certbot
fi

# Stop nginx temporarily
echo "⏸️ Stopping nginx..."
docker compose stop nginx

# Get certificate
echo "🔒 Obtaining SSL certificate..."
certbot certonly \
    --standalone \
    --preferred-challenges http \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

# Create SSL directory for docker volume
mkdir -p /etc/letsencrypt

# Copy production nginx config
echo "📝 Activating production nginx config..."
cp nginx/conf.d/production.conf.example nginx/conf.d/default.conf

# Update docker-compose to mount SSL certs
echo "🔄 Restarting with SSL..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Setup auto-renewal
echo "⏰ Setting up auto-renewal..."
cat > /etc/cron.d/certbot-renew << 'EOF'
0 3 * * * root certbot renew --quiet --deploy-hook "docker compose -C /opt/cyberbolt restart nginx"
EOF

echo ""
echo "======================"
echo "✅ SSL setup complete!"
echo "🌐 Visit: https://$DOMAIN"
echo "🔄 Auto-renewal configured (daily at 3 AM)"
echo "======================"
