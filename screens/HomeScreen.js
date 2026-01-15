import React from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
// Custom navigation passed as prop
import { WalletConnector } from '../components/WalletConnector';

export default function HomeScreen({ navigation }) {
  // Mock wallet state since we're not using the store
  const wallet = { isConnected: false };
  const currentSwap = null;

  const handleStartSwap = () => {
    if (!wallet.isConnected) {
      Alert.alert(
        'Wallet Required',
        'Please connect your wallet first to start a swap.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('SwapSetup');
  };

  const handleViewSwap = () => {
    if (currentSwap?.id) {
      navigation.navigate('SwapStatus', { swapId: currentSwap.id });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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
          <WalletConnector />
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
              onPress={handleViewSwap}
              style={styles.secondaryButton}
            >
              View Current Swap
            </Button>
          )}

          <Button
            mode="text"
            onPress={() => navigation.navigate('Settings')}
            style={styles.settingsButton}
          >
            Settings
          </Button>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Title style={styles.featureIcon}>🔒</Title>
            <Paragraph style={styles.featureText}>No KYC Required</Paragraph>
          </View>
          <View style={styles.feature}>
            <Title style={styles.featureIcon}>🛡️</Title>
            <Paragraph style={styles.featureText}>Atomic Swaps</Paragraph>
          </View>
          <View style={styles.feature}>
            <Title style={styles.featureIcon}>🕵️</Title>
            <Paragraph style={styles.featureText}>Privacy First</Paragraph>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60, // More padding for iOS notch devices
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
    marginBottom: 30,
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
  walletCard: {
    backgroundColor: '#1a1a1a',
  },
  walletTitle: {
    color: '#ffffff',
  },
  walletText: {
    color: '#cccccc',
  },
  connectButton: {
    borderColor: '#f97316',
    marginTop: 12,
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
});
