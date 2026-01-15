import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { Modal, Portal, Card, Title, Paragraph, Button, IconButton, Chip } from 'react-native-paper';
import { theme } from '../../lib/theme';

interface BravePromoProps {
  visible: boolean;
  onDismiss: () => void;
}

export function BravePromo({ visible, onDismiss }: BravePromoProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Detect if user is using Brave
  const isBraveBrowser = () => {
    if (Platform.OS !== 'web') return false;
    const userAgent = navigator.userAgent;
    return userAgent.includes('Brave');
  };

  const handleDownloadBrave = () => {
    const braveUrls = {
      ios: 'https://apps.apple.com/app/brave-private-web-browser/id1052879175',
      android: 'https://play.google.com/store/apps/details?id=com.brave.browser',
      web: 'https://brave.com/download/',
    };

    const platform = Platform.OS as keyof typeof braveUrls;
    const url = braveUrls[platform] || braveUrls.web;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open browser. Please visit brave.com/download manually.');
    });
  };

  const handleLearnMore = () => {
    Linking.openURL('https://brave.com/wallet/').catch(() => {
      Alert.alert('Error', 'Could not open browser. Please visit brave.com/wallet manually.');
    });
  };

  const handleDismiss = () => {
    if (dontShowAgain) {
      // Store preference (in a real app, this would persist)
      localStorage.setItem('bravePromoDismissed', 'true');
    }
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.braveIcon}>
                <Paragraph style={styles.braveLetter}>B</Paragraph>
              </View>
              <View>
                <Title style={styles.title}>Brave Browser</Title>
                <Paragraph style={styles.subtitle}>Enhanced Privacy & Wallet Support</Paragraph>
              </View>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={handleDismiss}
              style={styles.closeButton}
            />
          </View>

          <Card.Content style={styles.content}>
            <Paragraph style={styles.description}>
              For the best experience with WalletConnect and built-in crypto wallet support,
              we recommend using Brave Browser. It includes:
            </Paragraph>

            <View style={styles.features}>
              <View style={styles.feature}>
                <Paragraph style={styles.featureIcon}>🔐</Paragraph>
                <Paragraph style={styles.featureText}>Built-in Tor integration</Paragraph>
              </View>
              <View style={styles.feature}>
                <Paragraph style={styles.featureIcon}>👛</Paragraph>
                <Paragraph style={styles.featureText}>Native WalletConnect support</Paragraph>
              </View>
              <View style={styles.feature}>
                <Paragraph style={styles.featureIcon}>🛡️</Paragraph>
                <Paragraph style={styles.featureText}>Enhanced privacy features</Paragraph>
              </View>
              <View style={styles.feature}>
                <Paragraph style={styles.featureIcon}>🚫</Paragraph>
                <Paragraph style={styles.featureText}>Blocks trackers & ads</Paragraph>
              </View>
            </View>

            <View style={styles.walletSupport}>
              <Paragraph style={styles.walletTitle}>Supported Wallets:</Paragraph>
              <View style={styles.walletChips}>
                <Chip icon="ethereum" style={styles.chip}>Ethereum</Chip>
                <Chip icon="bitcoin" style={styles.chip}>Bitcoin</Chip>
                <Chip icon="wallet" style={styles.chip}>USDT</Chip>
                <Chip icon="dots-horizontal" style={styles.chip}>50+ More</Chip>
              </View>
            </View>

            <View style={styles.privacyNote}>
              <Paragraph style={styles.privacyText}>
                🕵️ Brave respects your privacy - no tracking, no data collection.
              </Paragraph>
            </View>
          </Card.Content>

          <Card.Actions style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleLearnMore}
              style={styles.learnMoreButton}
            >
              Learn More
            </Button>
            <Button
              mode="contained"
              onPress={handleDownloadBrave}
              style={styles.downloadButton}
            >
              Download Brave
            </Button>
          </Card.Actions>

          <View style={styles.footer}>
            <View style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="dontShowAgain" style={styles.checkboxLabel}>
                Don't show again
              </label>
            </View>
          </View>
        </Card>
      </Modal>
    </Portal>
  );
}

// Hook for managing Brave promo state
export function useBravePromo() {
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Only show on web platform
    if (Platform.OS === 'web') {
      // Check if user has dismissed before
      const dismissed = localStorage.getItem('bravePromoDismissed') === 'true';

      if (!dismissed) {
        // Show promo after a delay
        const timer = setTimeout(() => {
          setShowPromo(true);
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismissPromo = () => setShowPromo(false);

  return {
    showPromo,
    dismissPromo,
  };
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    maxWidth: 500,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  braveIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  braveLetter: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 2,
  },
  subtitle: {
    color: '#cccccc',
    fontSize: 14,
  },
  closeButton: {
    margin: -8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  description: {
    color: '#cccccc',
    lineHeight: 20,
    marginBottom: 16,
  },
  features: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    color: '#ffffff',
    fontSize: 14,
  },
  walletSupport: {
    marginBottom: 16,
  },
  walletTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  walletChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#2a2a2a',
  },
  privacyNote: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  privacyText: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  learnMoreButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#f97316',
  },
  downloadButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#ff6b35',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    color: '#cccccc',
    fontSize: 14,
  },
});
