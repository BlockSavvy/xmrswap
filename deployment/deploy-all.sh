#!/bin/bash

# Complete XMR Swap Deployment Orchestrator
# Runs all deployment steps in sequence
#
# Usage: chmod +x deploy-all.sh && ./deploy-all.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${PURPLE}🔒 XMR Swap - Complete Privacy Deployment${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}┌─ $1${NC}"
    echo -e "${BLUE}└───────────────────────────────────────────────${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"

    local missing_deps=()

    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    else
        local node_version=$(node -v | sed 's/v//')
        echo -e "${GREEN}✅ Node.js ${node_version}${NC}"
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        local npm_version=$(npm -v)
        echo -e "${GREEN}✅ npm ${npm_version}${NC}"
    fi

    # Check Expo CLI
    if ! command -v expo &> /dev/null; then
        missing_deps+=("Expo CLI")
    else
        echo -e "${GREEN}✅ Expo CLI${NC}"
    fi

    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+=("Git")
    else
        echo -e "${GREEN}✅ Git${NC}"
    fi

    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        echo -e "${RED}❌ Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}💡 Install missing dependencies and run again${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ All prerequisites satisfied${NC}"
}

# Function to build the application
build_application() {
    print_section "Building Application"

    cd "$PROJECT_DIR"

    # Install dependencies
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install

    # Build for web
    echo -e "${BLUE}🔨 Building for web...${NC}"
    npx expo export --platform web

    # Verify build
    if [[ -d "dist" && -f "dist/index.html" ]]; then
        echo -e "${GREEN}✅ Web build successful${NC}"
    else
        echo -e "${RED}❌ Web build failed${NC}"
        exit 1
    fi

    # Build mobile apps (optional)
    read -p "Build mobile apps? (y/N): " BUILD_MOBILE
    if [[ $BUILD_MOBILE =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📱 Building mobile apps...${NC}"

        # Check if EAS is configured
        if [[ ! -f "eas.json" ]]; then
            echo -e "${YELLOW}⚠️  EAS not configured. Run 'npx eas build:configure' first${NC}"
        else
            npx eas build --platform all --profile production --non-interactive
            echo -e "${GREEN}✅ Mobile builds initiated${NC}"
        fi
    fi
}

# Function to setup repository
setup_repository() {
    print_section "Setting up Repository"

    read -p "Setup GitHub repository? (y/N): " SETUP_REPO
    if [[ $SETUP_REPO =~ ^[Yy]$ ]]; then
        if [[ -f "$SCRIPT_DIR/setup-repo.sh" ]]; then
            chmod +x "$SCRIPT_DIR/setup-repo.sh"
            "$SCRIPT_DIR/setup-repo.sh"
        else
            echo -e "${RED}❌ Repository setup script not found${NC}"
        fi
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    print_section "Vercel Deployment"

    read -p "Deploy to Vercel? (y/N): " DEPLOY_VERCEL
    if [[ $DEPLOY_VERCEL =~ ^[Yy]$ ]]; then
        cd "$PROJECT_DIR"

        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${BLUE}📦 Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi

        # Deploy
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
        vercel --prod

        echo -e "${GREEN}✅ Vercel deployment complete${NC}"
        echo -e "${YELLOW}💡 Configure custom domain in Vercel dashboard if needed${NC}"
    fi
}

# Function to prepare Tor deployment
prepare_tor_deployment() {
    print_section "Tor Hidden Service Preparation"

    echo -e "${BLUE}📋 Tor Deployment Instructions:${NC}"
    echo ""
    echo -e "${CYAN}1. Sign up for Privex VPS (privex.io):${NC}"
    echo "   • Use Tor Browser for registration"
    echo "   • Pay with Monero or Bitcoin (no KYC)"
    echo "   • Choose Sweden/NL location"
    echo "   • Minimum: 2GB RAM, 20GB SSD"
    echo ""

    echo -e "${CYAN}2. Initial VPS Setup:${NC}"
    echo "   ssh root@YOUR_VPS_IP"
    echo "   wget https://raw.githubusercontent.com/yourusername/xmrswap/main/deployment/tor-setup.sh"
    echo "   chmod +x tor-setup.sh && sudo ./tor-setup.sh"
    echo ""

    echo -e "${CYAN}3. Deploy Application:${NC}"
    echo "   # On your local machine:"
    echo "   scp -r dist/* root@YOUR_VPS_IP:/var/www/xmrswap/"
    echo ""
    echo "   # On VPS:"
    echo "   wget https://raw.githubusercontent.com/yourusername/xmrswap/main/deployment/deploy-app.sh"
    echo "   chmod +x deploy-app.sh && ./deploy-app.sh"
    echo ""

    echo -e "${CYAN}4. Access Your Service:${NC}"
    echo "   • .onion address saved in /root/xmrswap-onion.txt"
    echo "   • Access via Tor Browser: http://[address].onion"
    echo ""

    read -p "Do you have VPS details ready? (y/N): " VPS_READY
    if [[ $VPS_READY =~ ^[Yy]$ ]]; then
        read -p "Enter VPS IP address: " VPS_IP
        read -p "Enter VPS root password or key path: " VPS_ACCESS

        echo -e "${BLUE}🚀 Deploying to VPS...${NC}"

        # Copy deployment scripts
        scp "$SCRIPT_DIR/tor-setup.sh" root@$VPS_IP:/root/
        scp "$SCRIPT_DIR/deploy-app.sh" root@$VPS_IP:/root/

        # Copy built application
        echo -e "${BLUE}📤 Uploading application...${NC}"
        scp -r "$PROJECT_DIR/dist/"* root@$VPS_IP:/var/www/xmrswap/

        echo -e "${GREEN}✅ Files uploaded to VPS${NC}"
        echo -e "${YELLOW}💡 Run the setup scripts on your VPS:${NC}"
        echo "   ssh root@$VPS_IP"
        echo "   ./tor-setup.sh"
        echo "   ./deploy-app.sh"
    else
        echo -e "${YELLOW}💡 Prepare your Privex VPS and run the deployment scripts manually${NC}"
    fi
}

# Function to run tests
run_tests() {
    print_section "Running Tests"

    cd "$PROJECT_DIR"

    # Run linting
    if npm run lint &> /dev/null; then
        echo -e "${GREEN}✅ Linting passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Linting warnings (check manually)${NC}"
    fi

    # Run tests if they exist
    if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
        if npm test -- --watchAll=false &> /dev/null; then
            echo -e "${GREEN}✅ Tests passed${NC}"
        else
            echo -e "${YELLOW}⚠️  Some tests failed (check manually)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No test script configured${NC}"
    fi
}

# Function to show deployment summary
show_summary() {
    print_section "Deployment Summary"

    echo -e "${GREEN}✅ Application built successfully${NC}"
    echo -e "${GREEN}✅ Web version ready in ./dist/${NC}"

    if [[ -d ".git" ]]; then
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    fi

    echo ""
    echo -e "${BLUE}📋 Deployment Options Completed:${NC}"
    echo "• Web build: ✅ Ready"
    echo "• Repository: $([[ -d ".git" ]] && echo "✅ Setup" || echo "⏳ Pending")"
    echo "• Vercel: ⏳ Run 'vercel --prod' when ready"
    echo "• Tor Hidden Service: ⏳ Requires VPS setup"
    echo "• Mobile Apps: ⏳ Run EAS build when ready"

    echo ""
    echo -e "${PURPLE}🔒 Privacy Reminders:${NC}"
    echo "• Always use Tor Browser for sensitive operations"
    echo "• Never commit private keys or seeds"
    echo "• Test with small amounts first"
    echo "• Keep your Monero seed secure and offline"

    echo ""
    echo -e "${CYAN}🎉 Ready for anonymous deployment!${NC}"
}

# Main execution
main() {
    check_prerequisites
    build_application
    run_tests
    setup_repository
    deploy_vercel
    prepare_tor_deployment
    show_summary

    echo ""
    echo -e "${GREEN}🎯 All deployment preparations complete!${NC}"
    echo -e "${BLUE}📖 Check README.md for detailed deployment instructions${NC}"
}

# Run main function
main "$@"
