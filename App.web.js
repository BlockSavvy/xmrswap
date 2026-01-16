import React, { useState } from 'react';
import { registerRootComponent } from 'expo';
import { View, Text, StyleSheet, ScrollView, Alert, Platform, Linking, ActivityIndicator, TextInput } from 'react-native';
import { Button, Card, Title, Paragraph, Modal } from 'react-native-paper';


// Import theme (safe import)
import { theme } from './lib/theme';

// Import atomic swap functions
import { initiateSwap, checkSwapStatus, cancelSwap, getSwapQuote } from './lib/atomicSwap';

// Simple Brave promo component for web
function BravePromo({ visible, onDismiss }) {
  const [dismissed, setDismissed] = React.useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    if (Platform.OS === 'web') {
      localStorage.setItem('bravePromoDismissed', 'true');
    }
    onDismiss();
  };

  if (!visible || dismissed) return null;

  return (
    <Modal
      visible={true}
      onDismiss={handleDismiss}
      contentContainerStyle={{ margin: 20, maxWidth: 500, alignSelf: 'center' }}
    >
      <Card style={{ backgroundColor: '#1a1a1a' }}>
        <Card.Content>
          <Title style={{ color: '#ffffff' }}>Brave Browser</Title>
          <Paragraph style={{ color: '#cccccc' }}>
            For the best experience with WalletConnect, we recommend Brave Browser with built-in crypto wallet support.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => Linking.openURL('https://brave.com/download/')}
            style={{ marginTop: 16, backgroundColor: '#ff6b35' }}
          >
            Download Brave
          </Button>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={{ marginTop: 8 }}
          >
            Continue
          </Button>
        </Card.Content>
      </Card>
    </Modal>
  );
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
function WalletConnector({ onConnect, onDisconnect, wallet }) {
  const [walletType, setWalletType] = useState('eth');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    console.log('🔗 Wallet connect button clicked, walletType:', walletType);
    setConnecting(true);
    setError(null); // Clear any previous errors
    try {
      if (walletType === 'eth') {
        console.log('🔗 Connecting Ethereum wallet...');
        await connectEthereumWallet();
      } else {
        console.log('₿ Connecting Bitcoin wallet...');
        await connectBitcoinWallet();
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      setError(error.message); // Show error in UI
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to disconnect your wallet?')) {
        onDisconnect();
      }
    } else {
      Alert.alert(
        'Disconnect Wallet',
        'Are you sure you want to disconnect your wallet?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            onPress: () => onDisconnect(),
          },
        ]
      );
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
        // Provide helpful installation links
        const installMessage = 'No Ethereum wallet found. Please install one of these wallets:\n\n' +
          '• MetaMask: https://metamask.io/\n' +
          '• Trust Wallet: https://trustwallet.com/\n' +
          '• Coinbase Wallet: https://www.coinbase.com/wallet\n\n' +
          'After installing, refresh this page and try again.';

        throw new Error(installMessage);
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
    console.log('₿ Checking for Bitcoin wallets...');
    console.log('₿ window.unisat available:', typeof window.unisat !== 'undefined');
    try {
      // Check for Bitcoin wallet extensions (like Unisat)
      if (typeof window.unisat !== 'undefined') {
        console.log('₿ Unisat wallet found, requesting accounts...');
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
        console.log('❌ No Bitcoin wallet found');
        // Provide helpful installation links
        const installMessage = 'No Bitcoin wallet found. Please install one of these wallets:\n\n' +
          '• Unisat: https://unisat.io/\n' +
          '• Xverse: https://www.xverse.app/\n' +
          '• OKX Wallet: https://www.okx.com/web3\n\n' +
          'After installing, refresh this page and try again.';

        throw new Error(installMessage);
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

  // Show connected wallet state
  if (wallet.isConnected) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Wallet Connected</Title>

          <View style={styles.connectedWalletInfo}>
            <View style={styles.walletInfoRow}>
              <Text style={styles.walletInfoLabel}>Type:</Text>
              <Text style={styles.walletInfoValue}>
                {wallet.type === 'eth' ? '🔷 Ethereum' : '₿ Bitcoin'}
              </Text>
            </View>

            <View style={styles.walletInfoRow}>
              <Text style={styles.walletInfoLabel}>Network:</Text>
              <Text style={styles.walletInfoValue}>{wallet.network || 'Unknown'}</Text>
            </View>

            <View style={styles.walletInfoRow}>
              <Text style={styles.walletInfoLabel}>Address:</Text>
              <Text style={styles.walletInfoValue}>
                {wallet.address ?
                  `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` :
                  'Unknown'
                }
              </Text>
            </View>

            {wallet.balance && (
              <View style={styles.walletInfoRow}>
                <Text style={styles.walletInfoLabel}>Balance:</Text>
                <Text style={styles.walletInfoValue}>{wallet.balance}</Text>
              </View>
            )}
          </View>

          <View style={styles.walletActions}>
            <Button
              mode="outlined"
              onPress={handleDisconnect}
              style={styles.disconnectButton}
              textColor="#f97316"
            >
              Disconnect Wallet
            </Button>

            <Button
              mode="text"
              onPress={() => setWalletType(wallet.type === 'eth' ? 'btc' : 'eth')}
              style={styles.switchWalletButton}
              textColor="#cccccc"
            >
              Switch to {wallet.type === 'eth' ? 'Bitcoin' : 'Ethereum'}
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  // Show wallet connection UI
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

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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

  // Swap setup state (moved to app level to prevent recreation on navigation)
  const [swapSetupData, setSwapSetupData] = useState({
    selectedCrypto: 'btc',
    amount: '',
    xmrAddress: ''
  });

  // Quote state for swap setup
  const [currentQuote, setCurrentQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Privacy features
  const [torStatus, setTorStatus] = useState(null);
  const [privacyScore, setPrivacyScore] = useState(0);
  const [showTorWarning, setShowTorWarning] = useState(false);
  const { showPromo, dismissPromo } = useBravePromo();

  // Initialize privacy detection (with error handling for CORS)
  React.useEffect(() => {
    const initializePrivacy = async () => {
      try {
        const status = await detectTorUsage();
        setTorStatus(status);

        const hasBrave = Platform.OS === 'web' && navigator?.userAgent?.includes('Brave');
        setPrivacyScore(getPrivacyScore(status, hasBrave || false));

        setShowTorWarning(shouldShowTorWarning(status));
      } catch (error) {
        console.warn('Privacy detection failed (expected on some networks):', error);
        // Set default values for web
        setTorStatus({ isUsingTor: false, confidence: 'unknown' });
        setPrivacyScore(20); // Basic web privacy score
      }
    };

    // Delay initialization to prevent blocking app load
    const timer = setTimeout(initializePrivacy, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-fetch quote when swap setup data changes
  React.useEffect(() => {
    const fetchQuote = async () => {
      if (!swapSetupData.amount || parseFloat(swapSetupData.amount) <= 0) {
        setCurrentQuote(null);
        return;
      }

      setQuoteLoading(true);
      try {
        const quote = await getSwapQuote(swapSetupData.selectedCrypto, parseFloat(swapSetupData.amount));
        setCurrentQuote(quote);
      } catch (error) {
        console.warn('Quote fetch failed:', error);
        setCurrentQuote(null);
      } finally {
        setQuoteLoading(false);
      }
    };

    // Debounce the quote fetching
    const timeoutId = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timeoutId);
  }, [swapSetupData.amount, swapSetupData.selectedCrypto]);

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
  };

  const handleWalletConnect = async (walletData) => {
    setWallet({ isConnected: true, ...walletData });
    if (Platform.OS === 'web') {
      window.alert(`Wallet Connected: Successfully connected to ${walletData.type === 'eth' ? 'Ethereum' : 'Bitcoin'} wallet`);
    } else {
      Alert.alert(
        'Wallet Connected',
        `Successfully connected to ${walletData.type === 'eth' ? 'Ethereum' : 'Bitcoin'} wallet`
      );
    }
  };

  const handleStartSwap = () => {
    if (!wallet.isConnected) {
      if (Platform.OS === 'web') {
        window.alert('Wallet Required: Please connect your wallet first.');
      } else {
        Alert.alert('Wallet Required', 'Please connect your wallet first.');
      }
      return;
    }
    navigate(SCREENS.SwapSetup);
  };

  const handleSwapSetup = async (swapParams) => {
    if (!swapParams.amount || !swapParams.xmrAddress) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    setQuoteLoading(true);
    try {
      // Fetch real DEX quote
      const quote = await getSwapQuote(swapParams.crypto, parseFloat(swapParams.amount));

      if (!quote) {
        throw new Error('Could not fetch exchange rate. Please try again.');
      }

      setCurrentQuote(quote);
      navigate(SCREENS.SwapConfirm, { ...swapParams, quote });
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`Quote Error: ${error.message}`);
      } else {
        Alert.alert('Quote Error', error.message);
      }
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSwapConfirm = async (swapData) => {
    try {
      const swap = await initiateSwap(swapData);
      setCurrentSwap(swap);
      navigate(SCREENS.SwapStatus, { swapId: swap.id });
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`Swap Failed: ${error.message}`);
      } else {
        Alert.alert('Swap Failed', error.message);
      }
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

          {/* Privacy Score Display */}
          <View style={styles.privacyScoreContainer}>
            <Text style={styles.privacyScoreLabel}>Privacy Score:</Text>
            <View style={styles.privacyScoreBar}>
              <View
                style={[
                  styles.privacyScoreFill,
                  {
                    width: `${Math.min(privacyScore, 100)}%`,
                    backgroundColor: privacyScore >= 70 ? '#10b981' :
                                   privacyScore >= 40 ? '#f59e0b' : '#ef4444'
                  }
                ]}
              />
            </View>
            <Text style={styles.privacyScoreValue}>{privacyScore}%</Text>
          </View>

          {showTorWarning && (
            <View style={styles.torWarning}>
              <Text style={styles.torWarningText}>
                ⚠️ For maximum privacy, use Tor Browser or Tor network
              </Text>
            </View>
          )}

          {torStatus && (
            <View style={styles.torStatus}>
              <Text style={styles.torStatusText}>
                🌐 Network: {torStatus.isUsingTor ? 'Tor' : 'Clearnet'}
                {torStatus.country && ` (${torStatus.country})`}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <View style={styles.walletSection}>
        <WalletConnector
          onConnect={handleWalletConnect}
          onDisconnect={() => setWallet({ isConnected: false })}
          wallet={wallet}
        />
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
    const handleContinue = () => {
      if (!swapSetupData.amount || !swapSetupData.xmrAddress) {
        if (Platform.OS === 'web') {
          window.alert('Missing Information: Please fill in all fields.');
        } else {
          Alert.alert('Missing Information', 'Please fill in all fields.');
        }
        return;
      }

      // Basic XMR address validation
      if (!swapSetupData.xmrAddress.startsWith('4') || swapSetupData.xmrAddress.length !== 95) {
        if (Platform.OS === 'web') {
          window.alert('Invalid Address: Please enter a valid Monero address.');
        } else {
          Alert.alert('Invalid Address', 'Please enter a valid Monero address.');
        }
        return;
      }

      handleSwapSetup({
        crypto: swapSetupData.selectedCrypto,
        amount: parseFloat(swapSetupData.amount),
        xmrAddress: swapSetupData.xmrAddress,
      });
    };

    // Quote fetching is now handled at the App level

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Title style={styles.screenTitle}>Setup Your Swap</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Select Cryptocurrency</Title>
            <View style={styles.cryptoOptions}>
            <Button
              mode={swapSetupData.selectedCrypto === 'btc' ? 'contained' : 'outlined'}
              onPress={() => setSwapSetupData(prev => ({ ...prev, selectedCrypto: 'btc' }))}
              style={[styles.cryptoButton, swapSetupData.selectedCrypto === 'btc' && styles.activeButton]}
            >
              ₿ Bitcoin (BTC)
            </Button>
            <Button
              mode={swapSetupData.selectedCrypto === 'usdt' ? 'contained' : 'outlined'}
              onPress={() => setSwapSetupData(prev => ({ ...prev, selectedCrypto: 'usdt' }))}
              style={[styles.cryptoButton, swapSetupData.selectedCrypto === 'usdt' && styles.activeButton]}
            >
              ₮ Tether (USDT)
            </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Amount & Address</Title>
            <Text style={styles.inputLabel}>Amount ({swapSetupData.selectedCrypto.toUpperCase()})</Text>
            <TextInput
              style={styles.textInput}
              value={swapSetupData.amount}
              onChangeText={(value) => setSwapSetupData(prev => ({ ...prev, amount: value }))}
              placeholder="0.00"
              keyboardType="numeric"
              placeholderTextColor="#888"
            />

            <Text style={styles.inputLabel}>XMR Receive Address</Text>
            <TextInput
              style={[styles.textInput, styles.addressInput]}
              value={swapSetupData.xmrAddress}
              onChangeText={(value) => setSwapSetupData(prev => ({ ...prev, xmrAddress: value }))}
              placeholder="4..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#888"
            />
          </Card.Content>
        </Card>

        {/* Quote Preview */}
        {swapSetupData.amount && parseFloat(swapSetupData.amount) > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Exchange Quote</Title>

              {quoteLoading ? (
                <View style={styles.quoteLoading}>
                  <Text style={styles.quoteLoadingText}>Fetching best rates...</Text>
                  <ActivityIndicator animating={true} color="#f97316" size="small" />
                </View>
              ) : currentQuote ? (
                <View style={styles.quoteDetails}>
                  <View style={styles.quoteRow}>
                    <Text style={styles.quoteLabel}>You Send:</Text>
                    <Text style={styles.quoteValue}>
                      {swapSetupData.amount} {swapSetupData.selectedCrypto.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={styles.quoteLabel}>Exchange Rate:</Text>
                    <Text style={styles.quoteValue}>
                      1 {swapSetupData.selectedCrypto.toUpperCase()} = {currentQuote.rate} XMR
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={styles.quoteLabel}>You Receive:</Text>
                    <Text style={styles.quoteValue}>
                      ≈ {currentQuote.xmrAmount} XMR
                    </Text>
                  </View>

                  <View style={styles.quoteRow}>
                    <Text style={styles.quoteLabel}>Fee ({currentQuote.feePercentage}%):</Text>
                    <Text style={styles.quoteValue}>
                      {currentQuote.fee} XMR
                    </Text>
                  </View>

                  <View style={styles.quoteDivider} />

                  <View style={styles.quoteRow}>
                    <Text style={styles.quoteLabelTotal}>Total XMR:</Text>
                    <Text style={styles.quoteValueTotal}>
                      {currentQuote.totalXmr} XMR
                    </Text>
                  </View>

                  <Text style={styles.quoteSource}>
                    Source: {currentQuote.source || 'Multiple DEXes'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.quoteError}>
                  Unable to fetch exchange rates. Please try again.
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

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

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Privacy Settings</Title>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Tor Integration:</Text>
            <Text style={styles.settingValue}>
              {torStatus ? (torStatus.isUsingTor ? '✅ Active' : '⚠️ Not Active') : 'Checking...'}
            </Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Privacy Score:</Text>
            <Text style={styles.settingValue}>{privacyScore}%</Text>
          </View>

          <Paragraph style={styles.settingDescription}>
            For maximum privacy, access this app through Tor Browser or Tor network.
            Your current connection: {torStatus?.isUsingTor ? 'Tor' : 'Clearnet'}
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>DEX Configuration</Title>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Primary DEX:</Text>
            <Text style={styles.settingValue}>Haveno (Decentralized)</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Fallback DEXes:</Text>
            <Text style={styles.settingValue}>Kraken, KuCoin</Text>
          </View>

          <Paragraph style={styles.settingDescription}>
            Liquidity is automatically managed through decentralized exchanges.
            No manual XMR purchasing required.
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Swap Settings</Title>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Fee Rate:</Text>
            <Text style={styles.settingValue}>1.5%</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Minimum Swap:</Text>
            <Text style={styles.settingValue}>0.0001 BTC / 1 USDT</Text>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Swap Timeout:</Text>
            <Text style={styles.settingValue}>30 minutes</Text>
          </View>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={() => navigate(SCREENS.Home)} style={styles.backButton}>
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

      {/* Privacy Components - Disabled due to SafeAreaProvider conflicts on web */}
      {/* <BravePromo visible={showPromo} onDismiss={dismissPromo} /> */}
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
  connectedWalletInfo: {
    marginTop: 16,
  },
  walletInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    marginBottom: 8,
  },
  walletInfoLabel: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletInfoValue: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  walletActions: {
    marginTop: 20,
    gap: 12,
  },
  disconnectButton: {
    borderRadius: 8,
  },
  switchWalletButton: {
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
  },
  quoteLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  quoteLoadingText: {
    color: '#cccccc',
    marginBottom: 10,
  },
  quoteDetails: {
    marginTop: 16,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  quoteLabel: {
    color: '#cccccc',
    fontSize: 14,
  },
  quoteValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quoteLabelTotal: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quoteValueTotal: {
    color: '#f97316',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quoteDivider: {
    height: 1,
    backgroundColor: '#404040',
    marginVertical: 12,
  },
  quoteSource: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  quoteError: {
    color: '#ef4444',
    textAlign: 'center',
    paddingVertical: 20,
  },
  privacyScoreContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  privacyScoreLabel: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 8,
  },
  privacyScoreBar: {
    height: 8,
    backgroundColor: '#404040',
    borderRadius: 4,
    marginBottom: 8,
  },
  privacyScoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  privacyScoreValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  torWarning: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  torWarningText: {
    color: '#f59e0b',
    fontSize: 12,
    textAlign: 'center',
  },
  torStatus: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
  },
  torStatusText: {
    color: '#10b981',
    fontSize: 12,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    marginBottom: 8,
  },
  settingLabel: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  settingValue: {
    color: '#ffffff',
    fontSize: 14,
  },
  settingDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  advancedButton: {
    marginTop: 16,
    borderRadius: 8,
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
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#404040',
    marginBottom: 10,
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
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
