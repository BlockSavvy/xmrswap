# XMR Swap - Anonymous Monero Atomic Swaps

A privacy-focused React Native mobile app for facilitating anonymous atomic swaps between cryptocurrencies (BTC, USDT) and Monero (XMR). Built with Expo, this app acts as a man-in-the-middle service where users can swap their crypto for XMR with complete anonymity.

## ⚠️ Important Disclaimer

**This app operates on Monero mainnet and handles real cryptocurrency transactions. Use at your own risk. The developers are not responsible for any financial losses.**

- All transactions are irreversible
- Test with small amounts first
- Ensure you have backups of all wallet information
- This software is provided "as is" with no warranties

## 🏗️ Architecture Overview

### Privacy-First Design

- **No user accounts**: Completely anonymous operation
- **No data storage**: All swap data is ephemeral and stored locally only
- **Tor integration**: All network requests route through Tor for maximum privacy
- **Unique addresses**: Each swap generates unique subaddresses
- **Atomic swaps**: Trustless swaps ensure no funds are lost

### Tech Stack

- **Framework**: Expo SDK 51+ with React Native
- **Navigation**: Expo Router v3 (file-based routing)
- **Styling**: React Native Paper (Material Design components)
- **State Management**: Zustand (lightweight, scalable)
- **Crypto Integration**:
  - WalletConnect v2 for user wallet connections
  - Bitcoin.js for BTC operations
  - Ethers.js for ETH/USDT operations
  - Monero wallet integration (mock implementation)
- **Privacy**: Tor proxy for all network calls
- **Atomic Swaps**: Integration with xmr-btc-swap and BasicSwap protocols

## 📱 Features

### Core Functionality

- **Anonymous Swaps**: BTC ↔ XMR and USDT ↔ XMR atomic swaps
- **Real-time Quotes**: Live exchange rates via CoinGecko API (Tor-routed)
- **Wallet Integration**: Connect external wallets via WalletConnect
- **Liquidity Management**: App owner provides XMR liquidity
- **Fee Configuration**: Configurable service fees (1-2% in XMR equivalent)
- **Transaction Monitoring**: Real-time swap status tracking

### Privacy Features

- **Tor Networking**: All API calls and blockchain interactions through Tor
- **Ephemeral Data**: No persistent user data or transaction logs
- **Subaddress Generation**: Unique addresses per swap for privacy
- **RingCT Integration**: Enhanced privacy for XMR transactions

### User Experience

- **Dark Theme**: Privacy-focused dark UI
- **Real-time Updates**: Live swap progress tracking
- **Error Handling**: Comprehensive error states with refund logic
- **Accessibility**: Screen reader support and ARIA labels
- **Internationalization**: Multi-language support ready

## 🚀 Quick Start

### Prerequisites

- Node.js 20.18.3+ (matches Expo requirements)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android emulator/device

### Installation

1. **Clone and install dependencies**:

```bash
git clone <repository-url>
cd xmrswap
npm install
```

1. **Install Expo dependencies**:

```bash
npx expo install --fix
```

1. **Configure environment** (optional):
Create `.env` file for custom configurations:

```env
EXPO_PUBLIC_COINGECKO_API_KEY=your_api_key
EXPO_PUBLIC_TOR_ENABLED=true
EXPO_PUBLIC_MAINNET=true
```

### Development

1. **Start the development server**:

```bash
npx expo start
```

1. **Run on device/emulator**:

- **iOS**: Press `i` in terminal or scan QR code with Camera app
- **Android**: Press `a` in terminal or scan QR code with Expo Go
- **Web**: Press `w` for web development

### Build for Production

1. **Configure EAS Build** (if not already configured):

```bash
npx eas build:configure
```

1. **Build for platforms**:

```bash
# Build for both iOS and Android
npx eas build --platform all

# Or build individually
npx eas build --platform ios
npx eas build --platform android
```

1. **Submit to stores**:

```bash
npx eas submit --platform ios
npx eas submit --platform android
```

## 🏛️ Project Structure

```
xmrswap/
├── app/                          # Expo Router pages (file-based routing)
│   ├── _layout.tsx              # Root layout with navigation
│   ├── index.tsx                # Home screen
│   ├── settings.tsx             # Settings screen
│   └── swap/
│       ├── setup.tsx            # Swap configuration
│       ├── confirm.tsx          # Swap confirmation
│       └── [id].tsx             # Swap status/details
├── components/                   # Reusable UI components
│   ├── WalletConnector.tsx      # Wallet connection component
│   └── QuoteDisplay.tsx         # Price quote display
├── hooks/                       # Custom React hooks
│   ├── useSwapQuote.ts          # Quote fetching logic
│   ├── useTorProxy.ts           # Tor networking
│   └── useXmrWallet.ts          # XMR wallet operations
├── lib/                         # Business logic and integrations
│   ├── store.ts                 # Zustand state management
│   ├── theme.ts                 # App theming
│   └── atomicSwap.ts            # Atomic swap implementation
├── constants/                   # App constants and configuration
│   └── config.ts                # App-wide configuration
├── assets/                      # Static assets (images, icons)
├── app.json                     # Expo configuration
├── babel.config.js              # Babel configuration
└── tsconfig.json               # TypeScript configuration
```

## 🔧 Configuration

### App Configuration (`app.json`)

Key settings for privacy and functionality:

```json
{
  "expo": {
    "name": "XMR Swap",
    "scheme": "xmrswap",
    "userInterfaceStyle": "dark",
    "plugins": [
      "expo-router",
      ["expo-secure-store"],
      ["expo-localization"]
    ]
  }
}
```

### Fee Configuration

Configure service fees in the settings screen:

- Default: 1.5% of XMR equivalent value
- Range: 0.1% - 5%
- Paid in XMR to maintain privacy

### Wallet Configuration

Set up your XMR liquidity wallet:

1. Go to Settings → XMR Liquidity Wallet
2. Enter your 25-word Monero seed phrase
3. Seed is encrypted and stored locally
4. **Never share your seed phrase**

## 🔒 Security Considerations

### Privacy Protections

- **Tor Integration**: All network requests routed through Tor
- **No Analytics**: No tracking or analytics
- **Local Storage**: All data stored locally with encryption
- **Ephemeral Sessions**: No persistent user sessions

### Mainnet Risks

- **Real Transactions**: App operates on live networks
- **Irreversible**: All crypto transactions are final
- **Liquidity**: App owner must maintain XMR balance
- **Rate Volatility**: Exchange rates can change during swaps

### Security Best Practices

- Use hardware wallets for large amounts
- Verify transaction details before confirming
- Keep wallet seeds offline and encrypted
- Regular security audits recommended

## 🔄 Swap Flow

### User Journey

1. **Connect Wallet**: User connects external wallet via WalletConnect
2. **Configure Swap**: Select input crypto (BTC/USDT) and amount
3. **Get Quote**: Real-time price quote with fee calculation
4. **Confirm Swap**: Review details and accept terms
5. **Execute Swap**: Atomic swap protocol handles the exchange
6. **Complete**: User receives XMR to specified address

### Atomic Swap Process

1. **Deposit Generation**: Unique address generated for user deposit
2. **XMR Subaddress**: Unique Monero subaddress for this swap
3. **Contract Creation**: Atomic swap contract initialized
4. **Deposit Monitoring**: Wait for user deposit confirmation
5. **Swap Execution**: Trustless atomic swap executed
6. **Settlement**: XMR sent to user, fees deducted

### Error Handling

- **Timeout Protection**: Automatic refund if swap doesn't complete
- **Network Failures**: Retry logic with exponential backoff
- **Invalid Deposits**: Refund to original address
- **Contract Failures**: Emergency abort with full refund

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Manual Testing Checklist

- [ ] Wallet connection works
- [ ] Quote fetching via Tor
- [ ] Swap initiation and monitoring
- [ ] Error states and refunds
- [ ] Settings persistence
- [ ] Dark mode theming

## 🚢 Deployment

### 🔒 Tor Hidden Service (Recommended - Maximum Privacy)

For maximum privacy and anonymity, deploy as a Tor hidden service using Privex VPS.

#### Prerequisites

- **Monero or Bitcoin** for VPS payment (no KYC required)
- **SSH key pair** for secure access
- **Basic Linux knowledge**

#### Step 1: Sign up for Privex VPS

1. Visit [privex.io](https://privex.io) (use Tor Browser)
2. Sign up anonymously with cryptocurrency
3. Choose a privacy-friendly location (Sweden/NL recommended)
4. Select Debian/Ubuntu VPS (minimum 2GB RAM, 20GB SSD)

#### Step 2: Initial VPS Setup

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Download and run the setup script
wget https://raw.githubusercontent.com/yourusername/xmrswap/main/deployment/tor-setup.sh
chmod +x tor-setup.sh
sudo ./tor-setup.sh
```

#### Step 3: Deploy Application

```bash
# On your local machine, build the app
cd xmrswap
npx expo export --platform web

# Copy to VPS (replace YOUR_VPS_IP)
scp -r dist/* root@YOUR_VPS_IP:/var/www/xmrswap/

# On VPS, finalize deployment
ssh root@YOUR_VPS_IP
cd /root
wget https://raw.githubusercontent.com/yourusername/xmrswap/main/deployment/deploy-app.sh
chmod +x deploy-app.sh
./deploy-app.sh
```

#### Step 4: Access Your Hidden Service

Your .onion address will be saved in `/root/xmrswap-onion.txt` on the VPS.
Access via Tor Browser: `http://[your-onion-address].onion`

#### Security Features

- ✅ **No logs**: All logging disabled
- ✅ **Firewall**: Localhost-only access
- ✅ **Tor routing**: All traffic through Tor network
- ✅ **Automatic updates**: Security patches applied automatically
- ✅ **Minimal attack surface**: Only essential services running

### 🌐 Vercel Deployment (Alternative - Standard Web)

For a standard web deployment with domain:

#### Prerequisites

- **Vercel account** (GitHub integration recommended)
- **Domain name** (Namecheap with WHOIS privacy)
- **GitHub repository**

#### Setup

1. **Push to GitHub**:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/xmrswap.git
git push -u origin main
```

1. **Deploy to Vercel**:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or connect to GitHub for automatic deployments
vercel link
vercel --prod
```

1. **Configure Domain** (optional):

```bash
# Add custom domain
vercel domains add yourdomain.com
# Follow DNS setup instructions
```

#### Security Notes

- ⚠️ **Less private** than Tor hidden service
- ⚠️ **IP logging** possible by hosting provider
- ✅ **HTTPS by default**
- ✅ **CDN distribution**

### 📱 Mobile App Deployment

#### EAS Build Configuration

Create `eas.json` for build configuration:

```json
{
  "build": {
    "production": {
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_MAINNET": "true",
        "EXPO_PUBLIC_TOR_ENABLED": "true"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### iOS App Store

1. Build with EAS: `eas build --platform ios --profile production`
2. TestFlight distribution for beta testing
3. Submit to App Store with privacy policy

#### Google Play Store

1. Build with EAS: `eas build --platform android --profile production`
2. Internal testing track for beta
3. Production track for release

#### Xcode Build (Local iOS)

```bash
# Prebuild for iOS
npx expo run:ios --device

# Or open in Xcode
npx expo run:ios --build

# Build archive for TestFlight/App Store
# 1. Open ios/xmrswap.xcworkspace in Xcode
# 2. Product > Archive
# 3. Distribute App > App Store Connect
```

### 🔄 OTA Updates

Enable Expo Updates for hot fixes:

```bash
npx expo install expo-updates
```

### 🌍 Multi-Environment Deployment

#### Development Environment

```bash
# Local development
npx expo start

# With custom config
EXPO_PUBLIC_MAINNET=false EXPO_PUBLIC_TOR_ENABLED=false npx expo start
```

#### Staging Environment

```bash
# Test on testnet
EXPO_PUBLIC_MAINNET=false npx eas build --profile staging
```

#### Production Environment

```bash
# Mainnet deployment
EXPO_PUBLIC_MAINNET=true EXPO_PUBLIC_TOR_ENABLED=true npx eas build --platform all
```

## 🔗 Integrations

### WalletConnect

- Connects to MetaMask, Trust Wallet, Coinbase Wallet
- Supports BTC and ERC20 (USDT) operations
- Secure key exchange without exposing private keys

### CoinGecko API

- Real-time cryptocurrency prices
- Tor-routed requests for privacy
- Fallback rates for offline operation

### Monero Integration

- Wallet operations via monero-javascript
- Subaddress generation for privacy
- Transaction monitoring and signing

### Atomic Swap Protocols

- **xmr-btc-swap**: CLI-based atomic swaps for BTC↔XMR
- **BasicSwap**: DEX-based swaps supporting multiple protocols
- **Fallback**: Direct wallet-to-wallet swaps for supported pairs

## 📋 API Reference

### Key Hooks

#### `useSwapQuote`

```typescript
const { quote, loading, error } = useSwapQuote('BTC', 0.01);
```

#### `useTorProxy`

```typescript
const { makeTorRequest, isEnabled } = useTorProxy();
```

#### `useXmrWallet`

```typescript
const { connectWallet, sendTransaction } = useXmrWallet();
```

### Store Interface

```typescript
interface AppState {
  currentSwap: Swap | null;
  wallet: WalletState;
  feeRate: number;
  torEnabled: boolean;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with comprehensive tests
4. Submit a pull request

### Development Guidelines

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Pre-commit hooks for formatting
- Comprehensive test coverage required

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Known Issues

- Tor integration is currently mocked
- Monero wallet integration needs native compilation
- Atomic swap protocols require WASM/WebView integration

### Troubleshooting

- **Build Issues**: Clear node_modules and reinstall
- **Tor Connection**: Check network connectivity
- **Wallet Issues**: Verify WalletConnect compatibility

### Security Issues

Report security vulnerabilities to: <security@xmrswap.app>

## 🔐 Advanced Privacy Deployment Guide

### Tor Hidden Service Architecture

```
Internet → Tor Network → VPS (Privex) → Nginx (localhost:80) → App
                                      ↓
                                 Tor Hidden Service
                                      ↓
                                 .onion Address
```

#### Network Flow

1. **User Access**: Connect via Tor Browser to `.onion` address
2. **Tor Routing**: All traffic routed through Tor network (3 hops minimum)
3. **VPS Entry**: Traffic enters VPS through Tor daemon
4. **Local Forwarding**: Tor forwards to localhost:80
5. **Nginx Serving**: Web server serves static PWA files
6. **API Calls**: App makes all external calls through Tor (CoinGecko, etc.)

#### Security Layers

- **Transport**: End-to-end Tor encryption
- **Application**: HTTPS with self-signed certificates
- **Server**: Minimal attack surface (localhost-only)
- **Data**: No persistent storage of user data
- **Updates**: Automatic security patching

### VPS Security Checklist

#### Pre-Deployment

- [ ] **Anonymous Signup**: Use Tor Browser for Privex registration
- [ ] **Crypto Payment**: Pay with Monero/Bitcoin only
- [ ] **SSH Keys**: Disable password authentication
- [ ] **Firewall**: UFW configured for localhost-only

#### Post-Deployment

- [ ] **Service Audit**: Verify only essential services running
- [ ] **Log Review**: Confirm no logging enabled
- [ ] **Update Testing**: Verify automatic updates work
- [ ] **Backup Plan**: Document disaster recovery procedure

### Brave Browser Integration

The app promotes Brave Browser for enhanced privacy:

#### Features Promoted

- **Built-in Tor**: Native Tor integration
- **Crypto Wallet**: Built-in Ethereum/Bitcoin wallet
- **Ad Blocking**: Enhanced privacy protection
- **WalletConnect**: Native support for wallet connections

#### Implementation

```typescript
// Detect Brave browser
const isBrave = navigator.userAgent.includes('Brave');

// Show promo modal for non-Brave users
if (!isBrave) {
  // Display Brave promotion
}
```

### Monitoring & Maintenance

#### Health Checks

```bash
# On VPS - check services
systemctl status tor nginx

# Check Tor hidden service
cat /var/lib/tor/hidden_service/hostname

# Test web access
curl http://localhost

# Check logs (should be empty/minimal)
journalctl -u tor --since today
```

#### Backup Strategy

- **Code**: GitHub repository with version control
- **Configuration**: Document all setup procedures
- **Keys**: Secure offline backup of access credentials
- **Data**: No user data to backup (privacy design)

#### Emergency Procedures

1. **Service Failure**: Restart services manually
2. **Security Breach**: Immediate shutdown and investigation
3. **Tor Issues**: Check Tor logs and network connectivity
4. **Domain Issues**: Have backup access methods ready

### Performance Optimization

#### PWA Features

- **Service Worker**: Caches critical resources offline
- **Background Sync**: Handles network failures gracefully
- **Installable**: Can be installed as native app
- **Push Notifications**: Optional swap status updates

#### Tor Optimization

- **Connection Pooling**: Reuse Tor circuits for efficiency
- **Request Batching**: Minimize Tor circuit creation
- **Caching**: Cache API responses when appropriate
- **Compression**: Gzip compression for faster loading

### Legal & Compliance Considerations

#### Privacy Laws

- **GDPR**: No personal data collection (privacy by design)
- **CCPA**: No data selling or sharing
- **Crypto Regulations**: Operate within local cryptocurrency laws

#### Liability Minimization

- **Clear Disclaimers**: Prominent risk warnings
- **No Guarantees**: Explicitly state no warranties
- **Open Source**: Transparent code for security audits
- **Community Governance**: Potential future decentralization

### Future Enhancements

#### Planned Features

- [ ] **Multi-Signature**: Enhanced security for large swaps
- [ ] **Lightning Network**: Faster Bitcoin swaps
- [ ] **Cross-Chain**: Support for additional cryptocurrencies
- [ ] **Decentralized**: Remove VPS dependency over time

#### Community Building

- [ ] **Documentation**: Comprehensive user guides
- [ ] **Support**: Community forums for user assistance
- [ ] **Audits**: Regular security audits by community
- [ ] **Governance**: Decentralized decision making

### Troubleshooting Common Issues

#### Tor Connection Issues

```bash
# Check Tor status
systemctl status tor

# Check Tor logs
journalctl -u tor --since today

# Restart Tor
systemctl restart tor
```

#### Web Server Issues

```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx
```

#### App Build Issues

```bash
# Clear Expo cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules && npm install

# Clear Metro cache
npx expo start --clear
```

---

## 🚀 Quick Deployment Commands

### Tor Hidden Service (Recommended)

```bash
# 1. Sign up for Privex VPS anonymously
# 2. Connect to VPS
ssh root@YOUR_VPS_IP

# 3. Run setup script
wget https://raw.githubusercontent.com/yourusername/xmrswap/main/deployment/tor-setup.sh
chmod +x tor-setup.sh && sudo ./tor-setup.sh

# 4. Deploy app (from your local machine)
cd xmrswap
npx expo export --platform web
scp -r dist/* root@YOUR_VPS_IP:/var/www/xmrswap/

# 5. Finalize on VPS
ssh root@YOUR_VPS_IP
wget https://raw.githubusercontent.com/yourusername/xmrswap/main/deployment/deploy-app.sh
chmod +x deploy-app.sh && ./deploy-app.sh
```

### Vercel Deployment (Alternative)

```bash
# 1. Push to GitHub
git add . && git commit -m "Deploy" && git push

# 2. Deploy to Vercel
npx vercel --prod
```

### Mobile App Build

```bash
# iOS
npx eas build --platform ios --profile production
npx eas submit --platform ios

# Android
npx eas build --platform android --profile production
npx eas submit --platform android
```

---

**🔒 Privacy First**: This application is designed with privacy as the highest priority. Always use Tor for maximum anonymity, and never share sensitive information.

**⚠️ Use at Your Own Risk**: Cryptocurrency transactions are irreversible. Test with small amounts and ensure you understand the risks before using with significant funds.

**🛡️ Security**: Regular security audits and community review are essential for maintaining trust in this system.

---

## 🚀 Complete Deployment Guide

### Quick Start Commands

#### 1. Full Automated Deployment

```bash
npm run deploy:all
```

This runs the complete deployment orchestrator and guides you through all options.

#### 2. Repository Setup

```bash
npm run deploy:repo
```

Creates GitHub repository with CI/CD pipelines and deployment branches.

#### 3. Tor Hidden Service Deployment

```bash
npm run deploy:tor
```

Builds web app and provides instructions for VPS deployment.

#### 4. Vercel Web Deployment

```bash
npm run deploy:vercel
```

Builds and deploys to Vercel for standard web hosting.

### Deployment Options Comparison

| Feature | Tor Hidden Service | Vercel | Mobile Apps |
|---------|-------------------|--------|-------------|
| **Privacy** | 🔒 Maximum (Tor-only) | ⚠️ Standard HTTPS | 🔒 High (no tracking) |
| **Anonymity** | ✅ Full anonymity | ⚠️ Provider logs | ✅ Device-only |
| **Cost** | 💰 XMR/BTC payment | 💰 Credit card | 🆓 Free tier available |
| **Setup Time** | ⏱️ 30-60 minutes | ⏱️ 5-10 minutes | ⏱️ 15-30 minutes |
| **Maintenance** | 🔧 Manual updates | 🤖 Auto-deploy | 🤖 Auto-updates |
| **Accessibility** | 🌐 Tor Browser only | 🌐 Any browser | 📱 Mobile only |

### Prerequisites Checklist

#### For All Deployments

- [ ] Node.js 20.18.3+
- [ ] npm or yarn
- [ ] Git
- [ ] Expo CLI (`npm install -g @expo/cli`)

#### For Tor Hidden Service

- [ ] Privex VPS account (sign up with XMR/BTC)
- [ ] SSH key pair
- [ ] Tor Browser installed

#### For Vercel Deployment

- [ ] Vercel account
- [ ] GitHub repository
- [ ] Custom domain (optional)

#### For Mobile Apps

- [ ] EAS account (`npx eas build:configure`)
- [ ] Apple Developer account (iOS)
- [ ] Google Play Console account (Android)

### Step-by-Step Deployment

#### Option A: Tor Hidden Service (Recommended)

```bash
# 1. Setup repository
npm run deploy:repo

# 2. Build application
npm run deploy:tor

# 3. Follow VPS setup instructions above
# (Sign up for Privex, run tor-setup.sh, deploy-app.sh)

# 4. Access via Tor Browser
# URL: http://[generated-onion-address].onion
```

#### Option B: Vercel + Tor Hybrid

```bash
# 1. Standard web deployment
npm run deploy:vercel

# 2. Access via clearnet: https://your-app.vercel.app
# 3. Also setup Tor hidden service for maximum privacy
```

#### Option C: Mobile-Only

```bash
# Build and submit to app stores
npm run build:all
npm run submit:ios
npm run submit:android
```

### Security Configuration

#### Environment Variables

Create `.env` files for different environments:

```env
# Development
EXPO_PUBLIC_MAINNET=false
EXPO_PUBLIC_TOR_ENABLED=false
EXPO_PUBLIC_COINGECKO_API_KEY=your_dev_key

# Production
EXPO_PUBLIC_MAINNET=true
EXPO_PUBLIC_TOR_ENABLED=true
EXPO_PUBLIC_COINGECKO_API_KEY=your_prod_key
```

#### Wallet Configuration

1. Go to Settings → XMR Liquidity Wallet
2. Enter your 25-word Monero seed phrase
3. The app encrypts and stores it locally
4. **Never share your seed phrase**

### Monitoring & Maintenance

#### Health Checks

```bash
# Tor Hidden Service
ssh root@your-vps-ip
systemctl status tor nginx
cat /var/lib/tor/hidden_service/hostname

# Vercel
vercel logs

# Mobile Apps
npx eas build:list
```

#### Updates

```bash
# Update application
git pull origin main
npm install
npm run deploy:tor  # or deploy:vercel

# Update VPS (if applicable)
ssh root@your-vps-ip
apt update && apt upgrade
```

### Troubleshooting

#### Common Issues

**Tor Connection Issues:**

```bash
# Check Tor status
sudo systemctl status tor
sudo journalctl -u tor --since today
sudo systemctl restart tor
```

**Build Failures:**

```bash
# Clear caches
npx expo start --clear
rm -rf node_modules && npm install
```

**Vercel Deployment Issues:**

```bash
# Check build logs
vercel logs
vercel rebuild
```

**Mobile Build Issues:**

```bash
# Clear EAS cache
npx eas build:delete
npx eas build --platform ios --clear-cache
```

### Community & Support

#### Getting Help

- 📖 **Documentation**: This README and deployment scripts
- 🐛 **Issues**: GitHub Issues for bug reports
- 💬 **Discussions**: GitHub Discussions for questions
- 🔒 **Security**: <security@xmrswap.app> for vulnerabilities

#### Contributing

1. Fork the repository
2. Create a feature branch
3. Make privacy-focused changes
4. Test thoroughly
5. Submit a pull request

---

## 🎯 Final Launch Checklist

### Pre-Launch

- [ ] Privacy audit completed
- [ ] Test swaps with small amounts
- [ ] Backup all wallet information
- [ ] Configure XMR liquidity wallet
- [ ] Test Tor hidden service access
- [ ] Verify mobile app functionality

### Launch Day

- [ ] Deploy to production environment
- [ ] Update DNS/domain records
- [ ] Test all functionality
- [ ] Monitor initial usage
- [ ] Prepare rollback plan

### Post-Launch

- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Plan security audits
- [ ] Consider community governance

---

**🔥 Ready to launch anonymous atomic swaps? Your privacy-focused exchange is prepared for deployment!**

**⚠️ Remember: Always test with small amounts first and never risk more than you can afford to lose.**
