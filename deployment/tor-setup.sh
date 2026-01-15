#!/bin/bash

# XMR Swap Tor Hidden Service Setup Script
# For Privex VPS (Monero/BTC paid, no KYC)
# Tested on Debian/Ubuntu 22.04 LTS
#
# Usage: chmod +x tor-setup.sh && sudo ./tor-setup.sh
# Then run: ./deploy-app.sh (after script completes)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TOR_USER="tor-user"
WEB_USER="web-user"
WEB_DIR="/var/www/xmrswap"
TOR_WEB_DIR="/var/lib/tor/hidden_service"
DOMAIN="xmrswap.onion"

echo -e "${BLUE}🔒 XMR Swap Tor Hidden Service Setup${NC}"
echo -e "${YELLOW}⚠️  This script will configure a privacy-focused Tor hidden service${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Update system
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl wget gnupg apt-transport-https lsb-release ca-certificates

# Install required packages
echo -e "${BLUE}📦 Installing required packages...${NC}"
apt install -y nginx tor ufw fail2ban unattended-upgrades apparmor apparmor-utils

# Create dedicated users
echo -e "${BLUE}👤 Creating dedicated system users...${NC}"
useradd -r -s /bin/false $TOR_USER 2>/dev/null || true
useradd -r -s /bin/false $WEB_USER 2>/dev/null || true

# Configure UFW firewall (localhost only)
echo -e "${BLUE}🔥 Configuring firewall (localhost-only access)...${NC}"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow from 127.0.0.1 to any port 80
ufw allow from 127.0.0.1 to any port 443
ufw allow ssh  # Allow SSH for initial setup
ufw --force enable

# Configure SSH for security
echo -e "${BLUE}🔐 Hardening SSH configuration...${NC}"
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PermitEmptyPasswords no/PermitEmptyPasswords no/' /etc/ssh/sshd_config
systemctl reload ssh

# Configure automatic security updates
echo -e "${BLUE}🔄 Configuring automatic security updates...${NC}"
cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

# Install and configure Tor
echo -e "${BLUE}🧅 Installing and configuring Tor...${NC}"

# Add Tor repository
wget -qO- https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | gpg --dearmor | tee /usr/share/keyrings/tor-archive-keyring.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/tor-archive-keyring.gpg] https://deb.torproject.org/torproject.org $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/tor.list

apt update
apt install -y tor deb.torproject.org-keyring

# Configure Tor hidden service
echo -e "${BLUE}🌐 Configuring Tor hidden service...${NC}"
cat >> /etc/tor/torrc << EOF

# XMR Swap Hidden Service Configuration
HiddenServiceDir /var/lib/tor/hidden_service/
HiddenServicePort 80 127.0.0.1:80
HiddenServicePort 443 127.0.0.1:443

# Enhanced security settings
HiddenServiceAllowUnknownPorts 0
HiddenServiceMaxStreams 5
HiddenServiceMaxStreamsCloseCircuit 1

# Disable logging
Log notice file /dev/null
EOF

# Set proper permissions for Tor hidden service
mkdir -p $TOR_WEB_DIR
chown $TOR_USER:$TOR_USER $TOR_WEB_DIR
chmod 700 $TOR_WEB_DIR

# Configure Nginx
echo -e "${BLUE}🌐 Configuring Nginx web server...${NC}"

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration for XMR Swap
cat > /etc/nginx/sites-available/xmrswap << EOF
server {
    listen 127.0.0.1:80;
    server_name localhost;
    root $WEB_DIR;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss: https:;" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Block access to sensitive files
    location ~ /\.(ht|env|git) {
        deny all;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/xmrswap /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Create web directory
mkdir -p $WEB_DIR
chown -R $WEB_USER:$WEB_USER $WEB_DIR
chmod -R 755 $WEB_DIR

# Configure log rotation to prevent disk filling
echo -e "${BLUE}📝 Configuring log rotation...${NC}"
cat > /etc/logrotate.d/xmrswap << EOF
$WEB_DIR/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 $WEB_USER $WEB_USER
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Disable unnecessary services
echo -e "${BLUE}🛡️ Disabling unnecessary services...${NC}"
systemctl disable --now syslog.socket rsyslog.service syslog.service
systemctl mask systemd-journald

# Configure fail2ban for additional security
echo -e "${BLUE}🛡️ Configuring fail2ban...${NC}"
cat > /etc/fail2ban/jail.local << EOF
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
systemctl enable tor nginx fail2ban unattended-upgrades apparmor
systemctl start tor nginx fail2ban

# Wait for Tor to generate hidden service
echo -e "${BLUE}⏳ Waiting for Tor hidden service to be ready...${NC}"
sleep 30

# Get the .onion address
if [[ -f "$TOR_WEB_DIR/hostname" ]]; then
    ONION_ADDRESS=$(cat $TOR_WEB_DIR/hostname)
    echo -e "${GREEN}✅ Tor hidden service created!${NC}"
    echo -e "${GREEN}🌐 Your .onion address: ${ONION_ADDRESS}${NC}"
    echo ""
    echo -e "${YELLOW}📋 Save this address securely!${NC}"
    echo "$ONION_ADDRESS" > /root/xmrswap-onion.txt
else
    echo -e "${RED}❌ Failed to create Tor hidden service${NC}"
    echo -e "${YELLOW}Check /var/log/tor/log for errors${NC}"
    exit 1
fi

# Final security check
echo -e "${BLUE}🔍 Running security audit...${NC}"
ufw status | grep -q "Status: active" && echo -e "${GREEN}✅ Firewall active${NC}" || echo -e "${RED}❌ Firewall not active${NC}"
systemctl is-active --quiet tor && echo -e "${GREEN}✅ Tor running${NC}" || echo -e "${RED}❌ Tor not running${NC}"
systemctl is-active --quiet nginx && echo -e "${GREEN}✅ Nginx running${NC}" || echo -e "${RED}❌ Nginx not running${NC}"

echo ""
echo -e "${GREEN}🎉 VPS setup complete!${NC}"
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Copy your app files to $WEB_DIR"
echo "2. Run: chown -R $WEB_USER:$WEB_USER $WEB_DIR"
echo "3. Test: curl http://localhost"
echo "4. Access via Tor: $ONION_ADDRESS"
echo ""
echo -e "${YELLOW}⚠️  Remember to remove SSH access after deployment${NC}"
echo -e "${YELLOW}⚠️  Your .onion address is saved in /root/xmrswap-onion.txt${NC}"
