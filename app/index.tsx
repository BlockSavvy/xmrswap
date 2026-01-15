import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { router } from 'expo-router';
import { useAppStore } from '../lib/store';
import { WalletConnector } from '../components/WalletConnector';

export default function HomeScreen() {
  const { wallet, currentSwap } = useAppStore();

  const handleStartSwap = () => {
    if (!wallet.isConnected) {
      Alert.alert(
        'Wallet Required',
        'Please connect your wallet first to start a swap.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('/swap/setup');
  };

  const handleViewSwap = () => {
    if (currentSwap?.id) {
      router.push(`/swap/${currentSwap.id}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
            onPress={() => router.push('/settings')}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
    padding: 20,
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
