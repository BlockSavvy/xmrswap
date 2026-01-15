import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, ProgressBar, Chip } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useAppStore } from '../../lib/store';

const STATUS_STEPS = [
  { key: 'pending', label: 'Waiting for Payment', progress: 0.2 },
  { key: 'confirmed', label: 'Payment Confirmed', progress: 0.4 },
  { key: 'executing', label: 'Executing Swap', progress: 0.7 },
  { key: 'completed', label: 'Swap Completed', progress: 1.0 },
];

export default function SwapStatusScreen() {
  const { id } = useLocalSearchParams();
  const { swaps, updateSwap } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);

  const swap = swaps.find(s => s.id === id);

  useEffect(() => {
    if (!swap) {
      Alert.alert(
        'Swap Not Found',
        'The requested swap could not be found.',
        [
          {
            text: 'Go Home',
            onPress: () => router.replace('/'),
          },
        ]
      );
      return;
    }

    // Find current status step
    const statusIndex = STATUS_STEPS.findIndex(step => step.key === swap.status);
    setCurrentStep(statusIndex >= 0 ? statusIndex : 0);

    // Simulate status progression for demo purposes
    if (swap.status === 'pending') {
      const timer = setTimeout(() => {
        updateSwap(swap.id, { status: 'confirmed' });
      }, 5000); // 5 seconds for demo

      return () => clearTimeout(timer);
    }

    if (swap.status === 'confirmed') {
      const timer = setTimeout(() => {
        updateSwap(swap.id, { status: 'executing' });
      }, 3000); // 3 seconds for demo

      return () => clearTimeout(timer);
    }

    if (swap.status === 'executing') {
      const timer = setTimeout(() => {
        const txHash = `xmr_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        updateSwap(swap.id, {
          status: 'completed',
          txHash,
        });
      }, 10000); // 10 seconds for demo

      return () => clearTimeout(timer);
    }
  }, [swap, updateSwap]);

  if (!swap) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Title style={styles.errorTitle}>Swap Not Found</Title>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusStep = STATUS_STEPS[currentStep];
  const progress = currentStatusStep?.progress || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f97316';
      case 'confirmed': return '#3b82f6';
      case 'executing': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Swap Status</Title>
          <Paragraph style={styles.swapId}>ID: {swap.id.slice(-8)}</Paragraph>
        </View>

        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Title style={styles.statusTitle}>Current Status</Title>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(swap.status) }]}
                textStyle={styles.statusChipText}
              >
                {STATUS_STEPS.find(s => s.key === swap.status)?.label || swap.status}
              </Chip>
            </View>

            <ProgressBar
              progress={progress}
              color={getStatusColor(swap.status)}
              style={styles.progressBar}
            />

            <View style={styles.stepsContainer}>
              {STATUS_STEPS.map((step, index) => (
                <View key={step.key} style={styles.step}>
                  <View
                    style={[
                      styles.stepIndicator,
                      {
                        backgroundColor: index <= currentStep ? getStatusColor(swap.status) : '#404040',
                      },
                    ]}
                  />
                  <Paragraph
                    style={[
                      styles.stepLabel,
                      {
                        color: index <= currentStep ? '#ffffff' : '#888888',
                        fontWeight: index === currentStep ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {step.label}
                  </Paragraph>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Content>
            <Title style={styles.detailsTitle}>Swap Details</Title>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Sent:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {swap.inputAmount.toFixed(8)} {swap.inputCrypto}
              </Paragraph>
            </View>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Receiving:</Paragraph>
              <Paragraph style={[styles.detailValue, styles.receiveValue]}>
                {swap.quote.totalXmr.toFixed(6)} XMR
              </Paragraph>
            </View>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Fee:</Paragraph>
              <Paragraph style={[styles.detailValue, styles.feeValue]}>
                {swap.quote.fee.toFixed(6)} XMR
              </Paragraph>
            </View>

            {swap.txHash && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>XMR TX:</Paragraph>
                <Paragraph style={styles.txHash}>
                  {swap.txHash}
                </Paragraph>
              </View>
            )}

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Created:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {swap.createdAt.toLocaleString()}
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        {swap.status === 'completed' && (
          <Card style={[styles.detailsCard, styles.successCard]}>
            <Card.Content>
              <Title style={[styles.detailsTitle, styles.successTitle]}>✅ Swap Completed!</Title>
              <Paragraph style={styles.successText}>
                Your XMR has been sent to your wallet. Check your transaction history to confirm receipt.
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        {swap.status === 'failed' && (
          <Card style={[styles.detailsCard, styles.errorCard]}>
            <Card.Content>
              <Title style={[styles.detailsTitle, styles.errorTitle]}>❌ Swap Failed</Title>
              <Paragraph style={styles.errorText}>
                The swap could not be completed. Any funds sent may be refunded automatically.
              </Paragraph>
            </Card.Content>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleGoHome}
            style={styles.homeButton}
          >
            {swap.status === 'completed' ? 'Start New Swap' : 'Back to Home'}
          </Button>
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
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  swapId: {
    color: '#888888',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    color: '#ef4444',
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
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
  statusChip: {
    borderRadius: 16,
  },
  statusChipText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressBar: {
    marginBottom: 24,
    height: 8,
    borderRadius: 4,
  },
  stepsContainer: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  stepLabel: {
    fontSize: 14,
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  successCard: {
    backgroundColor: '#0f2415',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  errorCard: {
    backgroundColor: '#2a1810',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  detailsTitle: {
    color: '#ffffff',
    marginBottom: 16,
  },
  successTitle: {
    color: '#10b981',
  },
  errorTitle: {
    color: '#ef4444',
  },
  successText: {
    color: '#cccccc',
  },
  errorText: {
    color: '#cccccc',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#cccccc',
    flex: 1,
  },
  detailValue: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  receiveValue: {
    color: '#10b981',
  },
  feeValue: {
    color: '#f97316',
  },
  txHash: {
    color: '#3b82f6',
    fontFamily: 'monospace',
    fontSize: 12,
    flex: 2,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 24,
  },
  homeButton: {
    backgroundColor: '#f97316',
  },
});
