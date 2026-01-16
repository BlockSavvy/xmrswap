#!/bin/bash

# Haveno DEX Daemon Setup for XMR Swap
# Installs and configures Haveno for automated liquidity management
#
# Usage: chmod +x haveno-setup.sh && sudo ./haveno-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

HAVENO_USER="haveno-user"
HAVENO_DIR="/opt/haveno"
HAVENO_DATA_DIR="/var/lib/haveno"

echo -e "${PURPLE}🏪 Haveno DEX Setup for XMR Swap${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Install Java
echo -e "${BLUE}☕ Installing Java 17 for Haveno...${NC}"
apt update
apt install -y openjdk-17-jre-headless curl wget

# Verify Java installation
java -version
if [[ $? -ne 0 ]]; then
    echo -e "${RED}❌ Java installation failed${NC}"
    exit 1
fi

# Create Haveno user and directories
echo -e "${BLUE}👤 Creating Haveno user and directories...${NC}"
useradd -r -s /bin/false $HAVENO_USER 2>/dev/null || true
mkdir -p $HAVENO_DIR
mkdir -p $HAVENO_DATA_DIR
chown -R $HAVENO_USER:$HAVENO_USER $HAVENO_DIR
chown -R $HAVENO_USER:$HAVENO_USER $HAVENO_DATA_DIR

# Download Haveno
echo -e "${BLUE}📥 Downloading Haveno DEX...${NC}"
HAVENO_VERSION="1.0.8"  # Check https://haveno.exchange/downloads/ for latest
HAVENO_URL="https://github.com/haveno-dex/haveno/releases/download/v${HAVENO_VERSION}/haveno_${HAVENO_VERSION}_all.deb"

echo "Downloading from: $HAVENO_URL"
curl -L -o /tmp/haveno.deb $HAVENO_URL

if [[ ! -f /tmp/haveno.deb ]]; then
    echo -e "${RED}❌ Failed to download Haveno${NC}"
    echo -e "${YELLOW}💡 Please download manually from: https://haveno.exchange/downloads/${NC}"
    exit 1
fi

# Install Haveno
echo -e "${BLUE}📦 Installing Haveno...${NC}"
dpkg -i /tmp/haveno.deb || apt install -f -y

# Configure Haveno for daemon mode
echo -e "${BLUE}⚙️ Configuring Haveno daemon...${NC}"

# Create Haveno configuration
cat > /etc/haveno.conf << EOF
# Haveno Daemon Configuration for XMR Swap
app.name=Haveno Daemon
app.version=${HAVENO_VERSION}

# Network settings
network.mainnet=true

# Data directory
haveno.data.dir=${HAVENO_DATA_DIR}

# Disable GUI
javaOptions=-Djava.awt.headless=true

# API settings
api.enabled=true
api.port=8079
api.host=localhost

# Monero settings (configure your node)
monero.rpc.host=localhost
monero.rpc.port=18081

# Bitcoin settings
bitcoin.regtest=false
bitcoin.testnet=false
EOF

# Set proper permissions
chown $HAVENO_USER:$HAVENO_USER /etc/haveno.conf
chmod 600 /etc/haveno.conf

# Create systemd service
echo -e "${BLUE}🔧 Creating systemd service...${NC}"
cat > /etc/systemd/system/haveno-daemon.service << EOF
[Unit]
Description=Haveno DEX Daemon
After=network.target
Wants=monero.service

[Service]
Type=simple
User=${HAVENO_USER}
Group=${HAVENO_USER}
Environment=JAVA_OPTS="-Xmx2g -Xms512m"
ExecStart=/usr/bin/haveno --daemon --config=/etc/haveno.conf
Restart=always
RestartSec=10

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=${HAVENO_DATA_DIR}
ProtectHome=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable haveno-daemon

# Create wallet setup script
echo -e "${BLUE}💰 Creating wallet setup helper...${NC}"
cat > /usr/local/bin/setup-haveno-wallet << 'EOF'
#!/bin/bash
# Haveno Wallet Setup Helper
# Run as haveno-user: sudo -u haveno-user setup-haveno-wallet

echo "Haveno Wallet Setup for XMR Swap"
echo "=================================="
echo ""
echo "You need to:"
echo "1. Create a Haveno account with password"
echo "2. Set up XMR wallet seed"
echo "3. Configure BTC payment account"
echo "4. Create API access"
echo ""
echo "Run Haveno GUI first to set this up:"
echo "sudo -u haveno-user haveno"
echo ""
echo "Then configure these environment variables:"
echo "HAVENO_ACCOUNT_ID=your_account_id"
echo "HAVENO_PASSWORD=your_password"
echo ""
echo "For automated trading, ensure your XMR wallet has funds"
EOF

chmod +x /usr/local/bin/setup-haveno-wallet

# Test Haveno installation
echo -e "${BLUE}🧪 Testing Haveno installation...${NC}"
haveno --version || echo -e "${YELLOW}⚠️ Haveno command not found in PATH${NC}"

# Final setup instructions
echo ""
echo -e "${GREEN}✅ Haveno DEX setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure Monero node:${NC}"
echo "   - Install monerod or connect to existing node"
echo "   - Update /etc/haveno.conf with RPC settings"
echo ""
echo -e "${YELLOW}2. Setup Haveno wallet:${NC}"
echo "   setup-haveno-wallet  # Run setup helper"
echo "   sudo -u haveno-user haveno  # Run GUI for initial setup"
echo ""
echo -e "${YELLOW}3. Configure API access:${NC}"
echo "   export HAVENO_ACCOUNT_ID='your_account_id'"
echo "   export HAVENO_PASSWORD='your_password'"
echo ""
echo -e "${YELLOW}4. Start Haveno daemon:${NC}"
echo "   sudo systemctl start haveno-daemon"
echo "   sudo systemctl status haveno-daemon"
echo ""
echo -e "${YELLOW}5. Test API connection:${NC}"
echo "   curl http://localhost:8079/api/v1/version"
echo ""
echo -e "${BLUE}🔐 Security notes:${NC}"
echo "• Haveno daemon runs as dedicated user"
echo "• Data stored in ${HAVENO_DATA_DIR}"
echo "• API only accessible locally (localhost:8079)"
echo "• Wallet seed never stored in config files"
echo ""
echo -e "${PURPLE}🎯 Haveno will provide decentralized liquidity for your XMR swaps!${NC}"
