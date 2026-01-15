import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, Checkbox } from 'react-native-paper';
import { router } from 'expo-router';
import { useAppStore } from '../../lib/store';

export default function SwapConfirmScreen() {
  const { currentSwap, addSwap } = useAppStore();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!currentSwap) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Title style={styles.errorTitle}>No Swap Data</Title>
          <Paragraph style={styles.errorText}>
            No swap data found. Please start a new swap.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => router.replace('/swap/setup')}
            style={styles.errorButton}
          >
            Start New Swap
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const handleConfirm = async () => {
    if (!acceptedTerms) {
      Alert.alert(
        'Terms Required',
        'Please accept the terms and conditions to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      // Generate unique swap ID
      const swapId = `swap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create the complete swap object
      const swap = {
        id: swapId,
        inputCrypto: currentSwap.inputCrypto,
        inputAmount: currentSwap.inputAmount,
        xmrReceiveAddress: currentSwap.xmrReceiveAddress,
        quote: currentSwap.quote,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to store
      addSwap(swap);

      // In real implementation, this would initiate the atomic swap
      // For now, we'll simulate the process
      Alert.alert(
        'Swap Initiated',
        `Send ${currentSwap.inputAmount} ${currentSwap.inputCrypto} to the generated address to start the swap.`,
        [
          {
            text: 'View Swap',
            onPress: () => router.replace(`/swap/${swapId}`),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to initiate swap. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Confirm Swap</Title>
          <Paragraph style={styles.subtitle}>
            Review your swap details before proceeding
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Swap Summary</Title>

            <View style={styles.summaryRow}>
              <Paragraph style={styles.label}>You Send:</Paragraph>
              <Paragraph style={styles.value}>
                {currentSwap.inputAmount.toFixed(8)} {currentSwap.inputCrypto}
              </Paragraph>
            </View>

            <View style={styles.summaryRow}>
              <Paragraph style={styles.label}>You Receive:</Paragraph>
              <Paragraph style={[styles.value, styles.receiveValue]}>
                {currentSwap.quote.totalXmr.toFixed(6)} XMR
              </Paragraph>
            </View>

            <View style={styles.summaryRow}>
              <Paragraph style={styles.label}>Exchange Rate:</Paragraph>
              <Paragraph style={styles.value}>
                1 {currentSwap.inputCrypto} = {currentSwap.quote.rate.toFixed(4)} XMR
              </Paragraph>
            </View>

            <View style={styles.summaryRow}>
              <Paragraph style={[styles.label, styles.feeLabel]}>Service Fee:</Paragraph>
              <Paragraph style={[styles.value, styles.feeValue]}>
                {currentSwap.quote.fee.toFixed(6)} XMR
              </Paragraph>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Paragraph style={styles.addressLabel}>XMR Address:</Paragraph>
              <Paragraph style={styles.addressValue}>
                {currentSwap.xmrReceiveAddress}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.warningCard}>
          <Card.Content>
            <Title style={styles.warningTitle}>⚠️ Important Warnings</Title>
            <Paragraph style={styles.warningText}>
              • Atomic swaps are irreversible once initiated
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Ensure your XMR address is correct - funds cannot be recovered if sent to wrong address
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Network fees may apply for the transaction
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Swap may take 10-30 minutes to complete
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Service operates on mainnet - use real funds at your own risk
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.termsContainer}>
          <View style={styles.termsRow}>
            <Checkbox
              status={acceptedTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              color="#f97316"
            />
            <Paragraph style={styles.termsText}>
              I understand the risks and accept that this service is provided "as is" with no guarantees.
            </Paragraph>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
            disabled={!acceptedTerms || loading}
            loading={loading}
          >
            Confirm & Start Swap
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#ef4444',
    textAlign: 'center',
  },
  errorText: {
    color: '#cccccc',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorButton: {
    backgroundColor: '#f97316',
  },
  card: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  warningCard: {
    backgroundColor: '#2a1810',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ffffff',
    marginBottom: 16,
  },
  warningTitle: {
    color: '#f97316',
  },
  warningText: {
    color: '#cccccc',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#cccccc',
    flex: 1,
  },
  value: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  receiveValue: {
    color: '#10b981',
    fontSize: 16,
  },
  feeLabel: {
    color: '#f97316',
  },
  feeValue: {
    color: '#f97316',
  },
  divider: {
    height: 1,
    backgroundColor: '#404040',
    marginVertical: 16,
  },
  addressLabel: {
    color: '#cccccc',
    flex: 1,
  },
  addressValue: {
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    color: '#cccccc',
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderColor: '#f97316',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#f97316',
  },
});
