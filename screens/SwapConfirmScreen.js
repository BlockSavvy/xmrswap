import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
// Custom navigation passed as prop
import { useAppStore } from '../lib/store';
import { QuoteDisplay } from '../components/QuoteDisplay';
import { initiateSwap } from '../lib/atomicSwap';

export default function SwapConfirmScreen({ navigation }) {
  const { wallet, addSwap } = useAppStore();
  const [loading, setLoading] = useState(false);

  const { crypto, amount, xmrAddress, quote } = navigation.state;

  const handleConfirmSwap = async () => {
    try {
      setLoading(true);

      // Mock swap initiation for now
      const swapData = {
        id: `swap_${Date.now()}`,
        inputCrypto: crypto,
        inputAmount: amount,
        expectedXmr: quote.expectedXmr,
        xmrAddress,
        status: 'pending',
        createdAt: new Date().toISOString(),
        quote,
      };

      // Add to store
      addSwap(swapData);

      // Navigate to status screen
      navigation.navigate('SwapStatus', { swapId: swapData.id });

    } catch (error) {
      Alert.alert(
        'Swap Failed',
        error.message || 'Failed to initiate swap. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmAlert = () => {
    Alert.alert(
      'Confirm Swap',
      `Are you sure you want to swap ${amount} ${crypto.toUpperCase()} for approximately ${quote.expectedXmr} XMR?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: handleConfirmSwap },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Title style={styles.title}>Confirm Your Swap</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Swap Details</Title>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>From:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {amount} {crypto.toUpperCase()}
              </Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>To:</Paragraph>
              <Paragraph style={styles.detailValue}>
                ~{quote.expectedXmr} XMR
              </Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Exchange Rate:</Paragraph>
              <Paragraph style={styles.detailValue}>
                1 {crypto.toUpperCase()} = {quote.rate} XMR
              </Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Fee:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {quote.fee} XMR ({quote.feePercentage}%)
              </Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>XMR Address:</Paragraph>
              <Paragraph style={styles.detailValue} numberOfLines={2}>
                {xmrAddress}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.warningCard}>
          <Card.Content>
            <Title style={styles.warningTitle}>⚠️ Important Warnings</Title>
            <Paragraph style={styles.warningText}>
              • This is an atomic swap - funds are secure if both parties follow the protocol
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Ensure your XMR address is correct - funds cannot be recovered if sent to wrong address
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Network fees apply and are not included in the quote
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Swap may take 10-60 minutes to complete
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.quoteCard}>
          <Card.Content>
            <Title style={styles.quoteTitle}>Final Quote</Title>
            <Paragraph style={styles.quoteText}>
              You'll receive: {quote.expectedXmr} XMR
            </Paragraph>
            <Paragraph style={styles.quoteText}>
              Service Fee: {quote.fee} XMR ({quote.feePercentage}%)
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={confirmAlert}
            style={styles.confirmButton}
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Initiating...' : 'Confirm Swap'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#ffffff',
    marginBottom: 16,
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
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: '#333333',
    marginVertical: 8,
  },
  warningCard: {
    backgroundColor: '#2a1a0a',
    borderColor: '#f97316',
    borderWidth: 1,
    marginBottom: 20,
  },
  warningTitle: {
    color: '#f97316',
    marginBottom: 12,
  },
  warningText: {
    color: '#cccccc',
    marginBottom: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#666666',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#f97316',
  },
  quoteCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  quoteTitle: {
    color: '#ffffff',
  },
  quoteText: {
    color: '#cccccc',
  },
});
