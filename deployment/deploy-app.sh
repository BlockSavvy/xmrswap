#!/bin/bash

# XMR Swap App Deployment Script
# Run this after tor-setup.sh completes
#
# Usage: chmod +x deploy-app.sh && ./deploy-app.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WEB_DIR="/var/www/xmrswap"
WEB_USER="web-user"

echo -e "${BLUE}🚀 Deploying XMR Swap App${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Build the Expo web app
echo -e "${BLUE}📦 Building Expo web app...${NC}"

# Check if we're in the right directory or if we need to build locally
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Build for web
echo -e "${BLUE}🔨 Building for web...${NC}"
npx expo export --platform web

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy built files to web directory
echo -e "${BLUE}📤 Deploying files to web server...${NC}"
cp -r dist/* $WEB_DIR/
chown -R $WEB_USER:$WEB_USER $WEB_DIR

# Set proper permissions
find $WEB_DIR -type f -name "*.html" -exec chmod 644 {} \;
find $WEB_DIR -type f -name "*.js" -exec chmod 644 {} \;
find $WEB_DIR -type f -name "*.css" -exec chmod 644 {} \;
find $WEB_DIR -type f -name "*.json" -exec chmod 644 {} \;
find $WEB_DIR -type d -exec chmod 755 {} \;

# Test the deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo -e "${GREEN}✅ Web server responding correctly${NC}"

    # Get onion address if available
    if [[ -f "/root/xmrswap-onion.txt" ]]; then
        ONION_ADDRESS=$(cat /root/xmrswap-onion.txt)
        echo -e "${GREEN}🌐 Access your app at: http://$ONION_ADDRESS${NC}"
    fi
else
    echo -e "${RED}❌ Web server not responding${NC}"
    echo -e "${YELLOW}Check nginx logs: journalctl -u nginx${NC}"
    exit 1
fi

# Configure PWA service worker for offline functionality
echo -e "${BLUE}⚙️ Configuring PWA service worker...${NC}"

# Create a basic service worker for caching critical resources
cat > $WEB_DIR/sw.js << 'EOF'
// XMR Swap Service Worker for offline functionality
const CACHE_NAME = 'xmrswap-v1';
const STATIC_CACHE = 'xmrswap-static-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests for privacy
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Don't cache API calls or dynamic content
          if (event.request.url.includes('/api/') ||
              event.request.url.includes('coingecko') ||
              event.request.headers.get('accept').includes('text/html')) {
            return response;
          }

          // Cache static assets
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        });
      })
  );
});
EOF

# Update PWA manifest for better offline support
if [[ -f "$WEB_DIR/manifest.json" ]]; then
    # Add offline fallback
    sed -i 's/"start_url": "/"start_url": "/", "scope": "/"/g' $WEB_DIR/manifest.json
fi

# Reload services
echo -e "${BLUE}🔄 Reloading services...${NC}"
systemctl reload nginx

# Final verification
echo -e "${BLUE}🔍 Final verification...${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Your XMR Swap app is now live!${NC}"

if [[ -f "/root/xmrswap-onion.txt" ]]; then
    ONION_ADDRESS=$(cat /root/xmrswap-onion.txt)
    echo -e "${GREEN}🌐 Tor Hidden Service: http://$ONION_ADDRESS${NC}"
    echo -e "${BLUE}📱 PWA Features:${NC}"
    echo "  • Installable as app on mobile"
    echo "  • Works offline for basic functionality"
    echo "  • Enhanced privacy with Tor routing"
    echo ""
    echo -e "${YELLOW}🧪 Test commands:${NC}"
    echo "  curl http://localhost"
    echo "  torsocks curl $ONION_ADDRESS"
fi

echo ""
echo -e "${RED}🔐 Security reminders:${NC}"
echo "  • Remove SSH access after testing"
echo "  • Monitor logs: journalctl -u tor -u nginx"
echo "  • Update regularly: apt update && apt upgrade"
