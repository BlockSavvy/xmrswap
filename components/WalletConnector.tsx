import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useAppStore } from '../lib/store';
import { Core } from '@walletconnect/core';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';
import { Web3Wallet, Web3WalletTypes } from '@walletconnect/web3wallet';

const PROJECT_ID = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Replace with actual project ID
const RELAY_URL = 'wss://relay.walletconnect.com';

export function WalletConnector() {
  const { wallet, setWallet } = useAppStore();
  const [connecting, setConnecting] = useState(false);
  const [web3wallet, setWeb3wallet] = useState<Web3Wallet | null>(null);

  useEffect(() => {
    const initWalletConnect = async () => {
      try {
        const core = new Core({
          projectId: PROJECT_ID,
          relayUrl: RELAY_URL,
        });

        const web3wallet = await Web3Wallet.init({
          core,
          metadata: {
            name: 'XMR Swap',
            description: 'Anonymous Monero Atomic Swaps',
            url: 'https://xmrswap.app',
            icons: ['https://walletconnect.com/walletconnect-logo.png'],
          },
        });

        setWeb3wallet(web3wallet);

        // Set up event listeners
        web3wallet.on('session_proposal', async (event) => {
          const { id, params } = event;

          try {
            const approvedNamespaces = buildApprovedNamespaces({
              proposal: params,
              supportedNamespaces: {
                eip155: {
                  chains: ['eip155:1', 'eip155:137', 'eip155:56'], // ETH, Polygon, BSC
                  methods: ['eth_sendTransaction', 'personal_sign', 'eth_sign'],
                  events: ['accountsChanged', 'chainChanged'],
                  accounts: [
                    'eip155:1:0x1234567890123456789012345678901234567890', // Mock
                    'eip155:137:0x1234567890123456789012345678901234567890',
                    'eip155:56:0x1234567890123456789012345678901234567890',
                  ],
                },
              },
            });

            await web3wallet.approveSession({
              id,
              namespaces: approvedNamespaces,
            });

            // Extract wallet info from session
            const session = web3wallet.getActiveSessions()[Object.keys(web3wallet.getActiveSessions())[0]];
            if (session) {
              const address = session.namespaces.eip155.accounts[0].split(':')[2];
              const chainId = parseInt(session.namespaces.eip155.accounts[0].split(':')[1]);

              setWallet({
                isConnected: true,
                address,
                chainId,
              });

              Alert.alert(
                'Wallet Connected',
                `Successfully connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
                [{ text: 'OK' }]
              );
            }
          } catch (error) {
            console.error('Session approval failed:', error);
            await web3wallet.rejectSession({
              id,
              reason: getSdkError('USER_REJECTED'),
            });
          }
        });

        web3wallet.on('session_delete', () => {
          setWallet({ isConnected: false });
        });

      } catch (error) {
        console.error('Failed to initialize WalletConnect:', error);
      }
    };

    if (PROJECT_ID !== 'YOUR_WALLETCONNECT_PROJECT_ID') {
      initWalletConnect();
    }
  }, [setWallet]);

  const handleConnect = async () => {
    if (!web3wallet) {
      Alert.alert(
        'WalletConnect Not Ready',
        'WalletConnect is not properly configured. Please check your project ID.',
        [{ text: 'OK' }]
      );
      return;
    }

    setConnecting(true);
    try {
      const { uri, approval } = await web3wallet.pair({ uri: undefined });

      // For demo purposes, we'll use a mock connection
      // In production, this would show a QR code or deep link
      await new Promise(resolve => setTimeout(resolve, 2000));

      setWallet({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        chainId: 1,
      });

      Alert.alert(
        'Wallet Connected',
        'Successfully connected to your wallet (demo mode).',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert(
        'Connection Failed',
        'Failed to connect to wallet. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWallet({
      isConnected: false,
    });
    Alert.alert(
      'Wallet Disconnected',
      'Your wallet has been disconnected.',
      [{ text: 'OK' }]
    );
  };

  if (wallet.isConnected) {
    return (
      <Card style={styles.connectedCard}>
        <Card.Content>
          <View style={styles.connectedHeader}>
            <Title style={styles.connectedTitle}>Wallet Connected</Title>
            <View style={styles.connectedIndicator} />
          </View>
          <Paragraph style={styles.addressText}>
            {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Unknown Address'}
          </Paragraph>
          <Button
            mode="outlined"
            onPress={handleDisconnect}
            style={styles.disconnectButton}
            textColor="#ef4444"
          >
            Disconnect
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Connect Wallet</Title>
        <Paragraph style={styles.text}>
          Connect your non-custodial wallet to start swapping crypto for XMR.
        </Paragraph>
        <Button
          mode="contained"
          onPress={handleConnect}
          style={styles.connectButton}
          disabled={connecting}
        >
          {connecting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </Button>
        <Paragraph style={styles.supportedText}>
          Supports: MetaMask, Trust Wallet, Coinbase Wallet
        </Paragraph>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
  },
  connectedCard: {
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
  },
  connectedTitle: {
    color: '#10b981',
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  connectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  text: {
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 16,
  },
  addressText: {
    color: '#cccccc',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: '#f97316',
    marginBottom: 8,
  },
  disconnectButton: {
    borderColor: '#ef4444',
  },
  supportedText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
  },
  spinner: {
    marginRight: 8,
  },
});
