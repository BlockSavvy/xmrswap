#!/bin/bash

# XMR Swap Repository Setup Script
# Creates GitHub repository and prepares for deployment
#
# Usage: chmod +x setup-repo.sh && ./setup-repo.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 XMR Swap Repository Setup${NC}"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI not found. Installing...${NC}"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
        sudo apt update
        sudo apt install gh
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gh
    else
        echo -e "${RED}❌ Unsupported OS. Please install GitHub CLI manually: https://cli.github.com/${NC}"
        exit 1
    fi
fi

# Check if already authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${BLUE}🔐 Authenticating with GitHub...${NC}"
    gh auth login
fi

# Get repository information
echo -e "${BLUE}📝 Repository Configuration${NC}"
read -p "Enter repository name (default: xmrswap): " REPO_NAME
REPO_NAME=${REPO_NAME:-xmrswap}

read -p "Make repository private? (y/N): " PRIVATE_CHOICE
if [[ $PRIVATE_CHOICE =~ ^[Yy]$ ]]; then
    PRIVATE_FLAG="--private"
else
    PRIVATE_FLAG="--public"
fi

read -p "Enter repository description: " REPO_DESC
REPO_DESC=${REPO_DESC:-"Anonymous Monero Atomic Swaps - Privacy-focused cryptocurrency exchange"}

# Create repository
echo -e "${BLUE}📦 Creating GitHub repository...${NC}"
gh repo create "$REPO_NAME" $PRIVATE_FLAG --description "$REPO_DESC" --source=. --remote=origin --push

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Repository created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create repository${NC}"
    exit 1
fi

# Get repository URL
REPO_URL=$(gh repo view "$REPO_NAME" --json url -q .url)
echo -e "${GREEN}🌐 Repository URL: $REPO_URL${NC}"

# Setup deployment branches
echo -e "${BLUE}🌿 Setting up deployment branches...${NC}"

# Create main branch if not exists
git branch -M main

# Create deployment branch for Tor
git checkout -b deployment/tor
echo "# Tor Hidden Service Deployment" > deployment/README.md
echo "" >> deployment/README.md
echo "This branch contains deployment scripts for Tor hidden service." >> deployment/README.md
git add deployment/
git commit -m "Add Tor deployment scripts"
git push -u origin deployment/tor

# Switch back to main
git checkout main

# Setup Vercel deployment (optional)
read -p "Setup Vercel deployment? (y/N): " VERCEL_CHOICE
if [[ $VERCEL_CHOICE =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}⚡ Setting up Vercel deployment...${NC}"

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}⚠️  Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi

    # Initialize Vercel project
    vercel --yes

    # Link to GitHub for automatic deployments
    vercel link --yes

    echo -e "${GREEN}✅ Vercel setup complete!${NC}"
    echo -e "${BLUE}💡 Vercel will automatically deploy on every push to main branch${NC}"
fi

# Setup GitHub Actions (optional)
read -p "Setup GitHub Actions for automated testing? (y/N): " ACTIONS_CHOICE
if [[ $ACTIONS_CHOICE =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🔧 Setting up GitHub Actions...${NC}"

    mkdir -p .github/workflows

    # Create CI workflow
    cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linter
      run: npm run lint

    - name: Run tests
      run: npm run test

    - name: Build web version
      run: npx expo export --platform web
EOF

    # Create deployment workflow
    cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Vercel

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build web version
      run: npx expo export --platform web

    - name: Deploy to Vercel
      run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      env:
        VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
EOF

    git add .github/
    git commit -m "Add GitHub Actions workflows"
    git push

    echo -e "${GREEN}✅ GitHub Actions setup complete!${NC}"
    echo -e "${YELLOW}⚠️  Remember to add VERCEL_TOKEN and VERCEL_PROJECT_ID secrets to your repository${NC}"
fi

# Final setup instructions
echo ""
echo -e "${GREEN}🎉 Repository setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. ${GREEN}Repository:${NC} $REPO_URL"
echo "2. ${GREEN}Clone locally:${NC} git clone $REPO_URL"
echo "3. ${GREEN}Tor Deployment:${NC} Follow deployment/tor-setup.sh"
if [[ $VERCEL_CHOICE =~ ^[Yy]$ ]]; then
    echo "4. ${GREEN}Vercel Dashboard:${NC} Check automatic deployments"
fi
if [[ $ACTIONS_CHOICE =~ ^[Yy]$ ]]; then
    echo "5. ${GREEN}GitHub Actions:${NC} Monitor CI/CD in Actions tab"
fi
echo ""
echo -e "${BLUE}🔐 Security reminders:${NC}"
echo "• Use Tor Browser for all GitHub access"
echo "• Enable 2FA on your GitHub account"
echo "• Never commit sensitive data (API keys, seeds, etc.)"
echo "• Review all commits before pushing"
echo ""
echo -e "${YELLOW}🚀 Ready for deployment!${NC}"
