import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, ProgressBar, Chip } from 'react-native-paper';
// Custom navigation passed as prop
import { useAppStore } from '../lib/store';
// import { checkSwapStatus } from '../lib/atomicSwap';

const STATUS_CONFIG = {
  pending: { color: '#f97316', label: 'Pending', progress: 0.2 },
  confirming: { color: '#3b82f6', label: 'Confirming', progress: 0.4 },
  swapping: { color: '#8b5cf6', label: 'Swapping', progress: 0.7 },
  completing: { color: '#10b981', label: 'Completing', progress: 0.9 },
  completed: { color: '#10b981', label: 'Completed', progress: 1.0 },
  failed: { color: '#ef4444', label: 'Failed', progress: 0 },
  refunded: { color: '#f59e0b', label: 'Refunded', progress: 0 },
};

export default function SwapStatusScreen({ navigation }) {
  const { swaps, updateSwap } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const { swapId } = navigation.state || {};
  const swap = swaps.find(s => s.id === swapId) || null;

  useEffect(() => {
    if (!swap) {
      navigation.goBack();
      return;
    }

    // Auto-refresh status for active swaps (mock implementation)
    if (['pending', 'confirming', 'swapping', 'completing'].includes(swap.status)) {
      const interval = setInterval(() => {
        // Mock status progression
        const statusOrder = ['pending', 'confirming', 'swapping', 'completing', 'completed'];
        const currentIndex = statusOrder.indexOf(swap.status);
        if (currentIndex < statusOrder.length - 1) {
          const nextStatus = statusOrder[currentIndex + 1];
          updateSwap({ ...swap, status: nextStatus });
        } else {
          clearInterval(interval);
        }
      }, 5000); // Update every 5 seconds for demo

      return () => clearInterval(interval);
    }
  }, [swap, navigation, updateSwap]);

  const handleRefresh = async () => {
    if (!swap) return;

    setRefreshing(true);
    try {
      // Mock refresh - just update the swap with current data
      updateSwap(swap);
    } catch (error) {
      console.error('Failed to refresh swap status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewSwap = () => {
      navigation.navigate('SwapSetup');
  };

  if (!swap) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Title style={styles.title}>Swap Not Found</Title>
          <Button mode="contained" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS_CONFIG[swap.status] || STATUS_CONFIG.pending;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Title style={styles.title}>Swap Status</Title>

        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Title style={styles.statusTitle}>Status</Title>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: statusConfig.color }]}
                textStyle={styles.statusChipText}
              >
                {statusConfig.label}
              </Chip>
            </View>

            <ProgressBar
              progress={statusConfig.progress}
              color={statusConfig.color}
              style={styles.progressBar}
            />

            <Paragraph style={styles.statusDescription}>
              {getStatusDescription(swap.status)}
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.detailsCard}>
          <Card.Content>
            <Title style={styles.detailsTitle}>Swap Details</Title>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Swap ID:</Paragraph>
              <Paragraph style={styles.detailValue} numberOfLines={1}>
                {swap.id}
              </Paragraph>
            </View>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>From:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {swap.inputAmount} {swap.inputCrypto.toUpperCase()}
              </Paragraph>
            </View>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>To:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {swap.expectedXmr} XMR
              </Paragraph>
            </View>

            <View style={styles.detailRow}>
              <Paragraph style={styles.detailLabel}>Created:</Paragraph>
              <Paragraph style={styles.detailValue}>
                {new Date(swap.createdAt).toLocaleString()}
              </Paragraph>
            </View>

            {swap.txHash && (
              <View style={styles.detailRow}>
                <Paragraph style={styles.detailLabel}>Transaction:</Paragraph>
                <Paragraph style={styles.detailValue} numberOfLines={1}>
                  {swap.txHash}
                </Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleRefresh}
            loading={refreshing}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            Refresh
          </Button>

          {['completed', 'failed', 'refunded'].includes(swap.status) && (
            <Button
              mode="contained"
              onPress={handleNewSwap}
              style={styles.newSwapButton}
            >
              New Swap
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusDescription(status) {
  switch (status) {
    case 'pending':
      return 'Waiting for your payment to be detected on the blockchain.';
    case 'confirming':
      return 'Payment detected. Waiting for confirmations.';
    case 'swapping':
      return 'Executing the atomic swap with the counterparty.';
    case 'completing':
      return 'Swap completed. Sending XMR to your address.';
    case 'completed':
      return 'Swap completed successfully! XMR has been sent to your address.';
    case 'failed':
      return 'Swap failed. Your funds will be refunded.';
    case 'refunded':
      return 'Funds have been refunded to your wallet.';
    default:
      return 'Unknown status.';
  }
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
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
    height: 32,
  },
  statusChipText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    marginBottom: 16,
  },
  statusDescription: {
    color: '#cccccc',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    marginBottom: 20,
  },
  detailsTitle: {
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  refreshButton: {
    flex: 1,
    borderColor: '#f97316',
  },
  newSwapButton: {
    flex: 1,
    backgroundColor: '#f97316',
  },
});
