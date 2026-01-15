import React, { useState } from 'react';
import { registerRootComponent } from 'expo';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Linking } from 'react-native';
import { Button, Card, Title, Paragraph, Modal } from 'react-native-paper';

// Import theme (safe import)
import { theme } from './lib/theme';

// Import atomic swap functions
import { initiateSwap, checkSwapStatus, cancelSwap } from './lib/atomicSwap';

// Simple Brave promo component for web
function BravePromo({ visible, onDismiss }) {
  if (!visible) return null;

  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    if (Platform.OS === 'web') {
      localStorage.setItem('bravePromoDismissed', 'true');
    }
    onDismiss();
  };

  return React.createElement(Modal, {
    visible: visible && !dismissed,
    onDismiss: handleDismiss,
    contentContainerStyle: { margin: 20, maxWidth: 500, alignSelf: 'center' }
  }, React.createElement(Card, { style: { backgroundColor: '#1a1a1a' } }, [
    React.createElement(Card.Content, { key: 'content' }, [
      React.createElement(Title, { key: 'title', style: { color: '#ffffff' } }, 'Brave Browser'),
      React.createElement(Paragraph, { key: 'desc', style: { color: '#cccccc' } },
        'For the best experience with WalletConnect, we recommend Brave Browser with built-in crypto wallet support.'),
      React.createElement(Button, {
        key: 'download',
        mode: 'contained',
        onPress: () => Linking.openURL('https://brave.com/download/'),
        style: { marginTop: 16, backgroundColor: '#ff6b35' }
      }, 'Download Brave'),
      React.createElement(Button, {
        key: 'dismiss',
        mode: 'outlined',
        onPress: handleDismiss,
        style: { marginTop: 8 }
      }, 'Continue')
    ])
  ]));
}

function useBravePromo() {
  const [showPromo, setShowPromo] = React.useState(false);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const dismissed = localStorage.getItem('bravePromoDismissed') === 'true';
      if (!dismissed) {
        const timer = setTimeout(() => setShowPromo(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return { showPromo, dismissPromo: () => setShowPromo(false) };
}
import { detectTorUsage, shouldShowTorWarning, getPrivacyScore, getBrowserPrivacyFeatures } from './lib/torUtils';

// Real WalletConnect integration for web
function WalletConnector({ onConnect }) {
  const [walletType, setWalletType] = useState('eth');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      if (walletType === 'eth') {
        await connectEthereumWallet();
      } else {
        await connectBitcoinWallet();
      }
    } catch (error) {
      Alert.alert('Connection Failed', error.message);
    } finally {
      setConnecting(false);
    }
  };

  const connectEthereumWallet = async () => {
    try {
      // Check if MetaMask or other Ethereum wallet is available
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        // Get network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = getNetworkName(chainId);

        onConnect({
          type: 'eth',
          address,
          network: networkName,
          provider: window.ethereum,
        });
      } else {
        throw new Error('No Ethereum wallet found. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      } else {
        throw error;
      }
    }
  };

  const connectBitcoinWallet = async () => {
    try {
      // Check for Bitcoin wallet extensions (like Unisat)
      if (typeof window.unisat !== 'undefined') {
        // Request account access
        const accounts = await window.unisat.requestAccounts();
        const address = accounts[0];

        // Get balance
        const balance = await window.unisat.getBalance();

        onConnect({
          type: 'btc',
          address,
          network: 'Bitcoin Mainnet',
          balance: `${balance.total} sats`,
          provider: window.unisat,
        });
      } else {
        throw new Error('No Bitcoin wallet found. Please install Unisat or another BTC wallet extension.');
      }
    } catch (error) {
      throw new Error('Failed to connect Bitcoin wallet: ' + error.message);
    }
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Connect Wallet</Title>

        <Paragraph style={styles.instruction}>
          Choose your wallet type and connect to start swapping cryptocurrencies securely.
        </Paragraph>

        <View style={styles.walletTypeContainer}>
          <Button
            mode={walletType === 'eth' ? 'contained' : 'outlined'}
            onPress={() => setWalletType('eth')}
            style={[styles.walletTypeButton, walletType === 'eth' && styles.activeButton]}
            labelStyle={styles.walletTypeLabel}
          >
            🔷 Ethereum
          </Button>
          <Button
            mode={walletType === 'btc' ? 'contained' : 'outlined'}
            onPress={() => setWalletType('btc')}
            style={[styles.walletTypeButton, walletType === 'btc' && styles.activeButton]}
            labelStyle={styles.walletTypeLabel}
          >
            ₿ Bitcoin
          </Button>
        </View>

        <Paragraph style={styles.walletDescription}>
          {walletType === 'eth'
            ? 'Connect an Ethereum wallet (MetaMask, Trust Wallet, etc.) to swap USDT or other ERC-20 tokens.'
            : 'Connect a Bitcoin wallet (Unisat, Xverse, etc.) to swap BTC directly to XMR.'
          }
        </Paragraph>

        <Paragraph style={styles.disclaimer}>
          🔒 Only connect wallets you trust. Your funds remain secure in your wallet.
        </Paragraph>

        <Button
          mode="contained"
          onPress={handleConnect}
          style={styles.connectButton}
          loading={connecting}
          disabled={connecting}
        >
          {connecting
            ? 'Connecting...'
            : `Connect ${walletType === 'eth' ? 'Ethereum' : 'Bitcoin'} Wallet`
          }
        </Button>
      </Card.Content>
    </Card>
  );
}

const SCREENS = {
  Home: 'Home',
  SwapSetup: 'SwapSetup',
  SwapConfirm: 'SwapConfirm',
  SwapStatus: 'SwapStatus',
  Settings: 'Settings',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.Home);
  const [wallet, setWallet] = useState({ isConnected: false });
  const [currentSwap, setCurrentSwap] = useState(null);

  // Privacy features
  const [torStatus, setTorStatus] = useState(null);
  const [privacyScore, setPrivacyScore] = useState(0);
  const [showTorWarning, setShowTorWarning] = useState(false);
  const { showPromo, dismissPromo } = useBravePromo();

  // Initialize privacy detection
  React.useEffect(() => {
    const initializePrivacy = async () => {
      try {
        const status = await detectTorUsage();
        setTorStatus(status);

        const hasBrave = navigator.userAgent.includes('Brave');
        setPrivacyScore(getPrivacyScore(status, hasBrave));

        setShowTorWarning(shouldShowTorWarning(status));
      } catch (error) {
        console.warn('Privacy detection failed:', error);
      }
    };

    initializePrivacy();
  }, []);

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
  };

  const handleWalletConnect = async (walletData) => {
    setWallet({ isConnected: true, ...walletData });
    Alert.alert(
      'Wallet Connected',
      `Successfully connected to ${walletData.type === 'eth' ? 'Ethereum' : 'Bitcoin'} wallet`
    );
  };

  const handleStartSwap = () => {
    if (!wallet.isConnected) {
      Alert.alert('Wallet Required', 'Please connect your wallet first.');
      return;
    }
    navigate(SCREENS.SwapSetup);
  };

  const handleSwapSetup = (swapParams) => {
    const quote = {
      expectedXmr: (swapParams.amount * 150).toFixed(6), // Mock rate
      rate: 150,
      fee: (swapParams.amount * 150 * 0.015).toFixed(6),
      feePercentage: 1.5,
    };
    navigate(SCREENS.SwapConfirm, { ...swapParams, quote });
  };

  const handleSwapConfirm = async (swapData) => {
    try {
      const swap = await initiateSwap(swapData);
      setCurrentSwap(swap);
      navigate(SCREENS.SwapStatus, { swapId: swap.id });
    } catch (error) {
      Alert.alert('Swap Failed', error.message);
    }
  };

  const renderHome = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Title style={styles.title}>XMR Swap</Title>
        <Paragraph style={styles.subtitle}>
          Anonymous Monero Atomic Swaps
        </Paragraph>
        <Paragraph style={styles.disclaimer}>
          ⚠️ Use at your own risk. No guarantees provided.
        </Paragraph>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Secure & Private</Title>
          <Paragraph style={styles.cardText}>
            Swap BTC or USDT for XMR anonymously using atomic swaps.
            No accounts, no logs, no traceability.
          </Paragraph>
        </Card.Content>
      </Card>

      <View style={styles.walletSection}>
        <WalletConnector onConnect={handleWalletConnect} />
      </View>

      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={handleStartSwap}
          style={styles.primaryButton}
          disabled={!wallet.isConnected}
        >
          Start New Swap
        </Button>

        {currentSwap && (
          <Button
            mode="outlined"
            onPress={() => navigate(SCREENS.SwapStatus, { swapId: currentSwap.id })}
            style={styles.secondaryButton}
          >
            View Current Swap
          </Button>
        )}

        <Button
          mode="text"
          onPress={() => navigate(SCREENS.Settings)}
          style={styles.settingsButton}
        >
          Settings
        </Button>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🔒</Text>
          <Text style={styles.featureText}>No KYC Required</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🛡️</Text>
          <Text style={styles.featureText}>Atomic Swaps</Text>
        </View>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🕵️</Text>
          <Text style={styles.featureText}>Privacy First</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderSwapSetup = () => {
    const [selectedCrypto, setSelectedCrypto] = useState('btc');
    const [amount, setAmount] = useState('');
    const [xmrAddress, setXmrAddress] = useState('');

    const handleContinue = () => {
      if (!amount || !xmrAddress) {
        Alert.alert('Missing Information', 'Please fill in all fields.');
        return;
      }

      // Basic XMR address validation
      if (!xmrAddress.startsWith('4') || xmrAddress.length !== 95) {
        Alert.alert('Invalid Address', 'Please enter a valid Monero address.');
        return;
      }

      handleSwapSetup({
        crypto: selectedCrypto,
        amount: parseFloat(amount),
        xmrAddress,
      });
    };

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Title style={styles.screenTitle}>Setup Your Swap</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Select Cryptocurrency</Title>
            <View style={styles.cryptoOptions}>
              <Button
                mode={selectedCrypto === 'btc' ? 'contained' : 'outlined'}
                onPress={() => setSelectedCrypto('btc')}
                style={[styles.cryptoButton, selectedCrypto === 'btc' && styles.activeButton]}
              >
                ₿ Bitcoin (BTC)
              </Button>
              <Button
                mode={selectedCrypto === 'usdt' ? 'contained' : 'outlined'}
                onPress={() => setSelectedCrypto('usdt')}
                style={[styles.cryptoButton, selectedCrypto === 'usdt' && styles.activeButton]}
              >
                ₮ Tether (USDT)
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Amount & Address</Title>
            <Text style={styles.inputLabel}>Amount ({selectedCrypto.toUpperCase()})</Text>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.webInput}
              placeholder="0.00"
            />

            <Text style={styles.inputLabel}>XMR Receive Address</Text>
            <textarea
              value={xmrAddress}
              onChange={(e) => setXmrAddress(e.target.value)}
              style={styles.webTextarea}
              placeholder="4..."
              rows={3}
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigate(SCREENS.Home)} style={styles.backButton}>
            Back
          </Button>
          <Button mode="contained" onPress={handleContinue} style={styles.continueButton}>
            Continue
          </Button>
        </View>
      </ScrollView>
    );
  };

  const renderSwapConfirm = () => {
    const { crypto, amount, xmrAddress, quote } = navigationState;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Title style={styles.screenTitle}>Confirm Your Swap</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Swap Details</Title>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>From:</Text>
              <Text style={styles.detailValue}>{amount} {crypto.toUpperCase()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To:</Text>
              <Text style={styles.detailValue}>{quote.expectedXmr} XMR</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Exchange Rate:</Text>
              <Text style={styles.detailValue}>1 {crypto.toUpperCase()} = {quote.rate} XMR</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Fee:</Text>
              <Text style={styles.detailValue}>{quote.fee} XMR ({quote.feePercentage}%)</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Title style={styles.warningTitle}>⚠️ Important Warnings</Title>
            <Paragraph style={styles.warningText}>
              • This is an atomic swap - funds are secure if both parties follow the protocol
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Ensure your XMR address is correct - funds cannot be recovered if sent to wrong address
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Swap may take 10-60 minutes to complete
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigate(SCREENS.SwapSetup)} style={styles.backButton}>
            Back
          </Button>
          <Button
            mode="contained"
            onPress={() => handleSwapConfirm({ crypto, amount, xmrAddress, expectedXmr: quote.expectedXmr, quote })}
            style={styles.confirmButton}
          >
            Confirm Swap
          </Button>
        </View>
      </ScrollView>
    );
  };

  const renderSwapStatus = () => {
    const { swapId } = navigationState;
    const [swapStatus, setSwapStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
      if (swapId) {
        const checkStatus = async () => {
          try {
            const status = await checkSwapStatus(swapId);
            setSwapStatus(status);
          } catch (error) {
            console.error('Status check failed:', error);
          } finally {
            setLoading(false);
          }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
      }
    }, [swapId]);

    if (loading || !swapStatus) {
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Title style={styles.screenTitle}>Loading Swap Status...</Title>
          <Paragraph style={styles.comingSoon}>Checking swap progress...</Paragraph>
        </ScrollView>
      );
    }

    const statusColors = {
      pending: '#f97316',
      confirming: '#3b82f6',
      swapping: '#8b5cf6',
      completing: '#10b981',
      completed: '#10b981',
      failed: '#ef4444',
      refunded: '#f59e0b',
    };

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Title style={styles.screenTitle}>Swap Status</Title>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Title style={styles.statusTitle}>Status</Title>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[swapStatus.status] }]}>
                <Text style={styles.statusText}>{swapStatus.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {
                  width: `${swapStatus.progress * 100}%`,
                  backgroundColor: statusColors[swapStatus.status]
                }]}
              />
            </View>

            <Paragraph style={styles.statusMessage}>{swapStatus.message}</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.detailsTitle}>Swap Details</Title>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Swap ID:</Text>
              <Text style={styles.detailValue}>{swapId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>{swapStatus.inputAmount} {swapStatus.inputCrypto}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expected XMR:</Text>
              <Text style={styles.detailValue}>{swapStatus.expectedXmr} XMR</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigate(SCREENS.Home)} style={styles.backButton}>
            Back to Home
          </Button>

          {(swapStatus.status === 'completed' || swapStatus.status === 'failed') && (
            <Button mode="contained" onPress={() => navigate(SCREENS.SwapSetup)} style={styles.newSwapButton}>
              New Swap
            </Button>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderSettings = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title style={styles.screenTitle}>Settings</Title>
      <Paragraph style={styles.comingSoon}>Coming Soon - App settings</Paragraph>
      <Button mode="outlined" onPress={() => navigate(SCREENS.Home)}>
        Back to Home
      </Button>
    </ScrollView>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.Home:
        return renderHome();
      case SCREENS.SwapSetup:
        return renderSwapSetup();
      case SCREENS.SwapConfirm:
        return renderSwapConfirm();
      case SCREENS.SwapStatus:
        return renderSwapStatus();
      case SCREENS.Settings:
        return renderSettings();
      default:
        return renderHome();
    }
  };

  return (
    <View style={styles.mainContainer}>
      {renderScreen()}

      {/* Privacy Components */}
      <BravePromo visible={showPromo} onDismiss={dismissPromo} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f97316',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#ffffff',
  },
  cardText: {
    color: '#cccccc',
  },
  walletSection: {
    marginBottom: 30,
  },
  actionSection: {
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#f97316',
  },
  secondaryButton: {
    borderColor: '#f97316',
  },
  settingsButton: {
    marginTop: 10,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  feature: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#cccccc',
    textAlign: 'center',
  },
  screenTitle: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  comingSoon: {
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#f97316',
    marginTop: 12,
  },
  walletTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  walletTypeButton: {
    flex: 1,
    borderColor: '#f97316',
  },
  activeButton: {
    backgroundColor: '#f97316',
  },
  walletTypeLabel: {
    fontSize: 14,
  },
  instruction: {
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  walletDescription: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 12,
  },
  cryptoOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cryptoButton: {
    flex: 1,
    borderColor: '#f97316',
  },
  inputLabel: {
    color: '#ffffff',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  webInput: {
    width: '100%',
    padding: 12,
    backgroundColor: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 16,
  },
  webTextarea: {
    width: '100%',
    padding: 12,
    backgroundColor: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'monospace',
    marginBottom: 16,
    resize: 'vertical',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    borderColor: '#666666',
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#f97316',
  },
  warningCard: {
    borderColor: '#f97316',
    borderWidth: 1,
  },
  warningTitle: {
    color: '#f97316',
  },
  warningText: {
    color: '#cccccc',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    color: '#cccccc',
    flex: 1,
  },
  detailValue: {
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#f97316',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    color: '#ffffff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusMessage: {
    color: '#cccccc',
    lineHeight: 20,
  },
  detailsTitle: {
    color: '#ffffff',
    marginBottom: 16,
  },
  newSwapButton: {
    flex: 1,
    backgroundColor: '#f97316',
  },
});

registerRootComponent(App);
