import React, { useState } from 'react';
import { View, Alert, StyleSheet, Platform } from 'react-native';
import { Button, Card, Title, Paragraph, SegmentedButtons } from 'react-native-paper';

export function WalletConnector() {
  const [connecting, setConnecting] = useState(false);
  const [walletType, setWalletType] = useState('eth'); // 'btc' or 'eth'
  const [connectedWallet, setConnectedWallet] = useState(null);

  const handleConnect = async () => {
    try {
      setConnecting(true);

      // Simulate wallet connection based on type
      if (walletType === 'eth') {
        // Mock Ethereum wallet connection
        const mockWallet = {
          type: 'eth',
          address: '0x742d35Cc4Dd6b8D8B5e1A3c4c2e6f8a9b0c1d2e3',
          network: 'Ethereum Mainnet',
          balance: '2.5 ETH',
        };
        setConnectedWallet(mockWallet);

        Alert.alert(
          'Wallet Connected',
          `Connected to Ethereum wallet: ${mockWallet.address.slice(0, 10)}...`
        );
      } else if (walletType === 'btc') {
        // Mock Bitcoin wallet connection
        const mockWallet = {
          type: 'btc',
          address: 'bc1qexamplewalletaddress1234567890',
          network: 'Bitcoin Mainnet',
          balance: '0.05 BTC',
        };
        setConnectedWallet(mockWallet);

        Alert.alert(
          'Wallet Connected',
          `Connected to Bitcoin wallet: ${mockWallet.address.slice(0, 10)}...`
        );
      }

    } catch (error) {
      Alert.alert(
        'Connection Failed',
        error.message || 'Failed to connect wallet. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          onPress: () => setConnectedWallet(null),
        },
      ]
    );
  };

  if (connectedWallet) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>
            {connectedWallet.type === 'eth' ? '🔷 Ethereum' : '₿ Bitcoin'} Wallet Connected
          </Title>
          <Paragraph style={styles.label}>Address:</Paragraph>
          <Paragraph style={styles.value}>
            {connectedWallet.address.slice(0, 10)}...{connectedWallet.address.slice(-8)}
          </Paragraph>
          <Paragraph style={styles.label}>Network:</Paragraph>
          <Paragraph style={styles.value}>{connectedWallet.network}</Paragraph>
          <Paragraph style={styles.label}>Balance:</Paragraph>
          <Paragraph style={styles.value}>{connectedWallet.balance}</Paragraph>
          <Button
            mode="outlined"
            onPress={handleDisconnect}
            style={styles.disconnectButton}
            textColor="#f97316"
          >
            Disconnect Wallet
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Connect Wallet</Title>

        <Paragraph style={styles.instruction}>
          Choose your wallet type and connect to start swapping cryptocurrencies securely.
        </Paragraph>

        {Platform.OS !== 'web' && (
          <SegmentedButtons
            value={walletType}
            onValueChange={setWalletType}
            buttons={[
              {
                value: 'eth',
                label: 'Ethereum',
              },
              {
                value: 'btc',
                label: 'Bitcoin',
              },
            ]}
            style={styles.segmentedButtons}
          />
        )}

        <Paragraph style={styles.walletDescription}>
          {walletType === 'eth'
            ? 'Connect an Ethereum wallet (MetaMask, Trust Wallet, etc.) to swap USDT or other ERC-20 tokens.'
            : 'Connect a Bitcoin wallet to swap BTC directly to XMR.'
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
  },
  instruction: {
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  walletDescription: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 12,
  },
  disclaimer: {
    color: '#f97316',
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 8,
    fontWeight: 'bold',
  },
  connectButton: {
    backgroundColor: '#f97316',
    marginTop: 8,
  },
  disconnectButton: {
    borderColor: '#f97316',
    marginTop: 12,
  },
  label: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  value: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 4,
  },
});
