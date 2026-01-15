import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';

interface Quote {
  xmrAmount: number;
  fee: number;
  totalXmr: number;
  rate: number;
}

interface QuoteDisplayProps {
  quote: Quote | null;
  loading: boolean;
  error: string | null;
  inputCrypto: 'BTC' | 'USDT';
  inputAmount: number;
  feeRate: number;
}

export function QuoteDisplay({
  quote,
  loading,
  error,
  inputCrypto,
  inputAmount,
  feeRate,
}: QuoteDisplayProps) {
  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContent}>
          <ActivityIndicator size="small" color="#f97316" />
          <Paragraph style={styles.loadingText}>Getting quote...</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={[styles.card, styles.errorCard]}>
        <Card.Content>
          <Title style={styles.errorTitle}>Quote Error</Title>
          <Paragraph style={styles.errorText}>{error}</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (!quote || inputAmount <= 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Quote</Title>
          <Paragraph style={styles.placeholderText}>
            Enter an amount to see your quote
          </Paragraph>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Swap Quote</Title>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>You Send:</Paragraph>
          <Paragraph style={styles.value}>
            {inputAmount.toFixed(8)} {inputCrypto}
          </Paragraph>
        </View>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>Exchange Rate:</Paragraph>
          <Paragraph style={styles.value}>
            1 {inputCrypto} = {quote.rate.toFixed(4)} XMR
          </Paragraph>
        </View>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>XMR Amount:</Paragraph>
          <Paragraph style={styles.value}>
            {quote.xmrAmount.toFixed(6)} XMR
          </Paragraph>
        </View>

        <View style={styles.quoteRow}>
          <Paragraph style={[styles.label, styles.feeLabel]}>Service Fee ({(feeRate * 100).toFixed(1)}%):</Paragraph>
          <Paragraph style={[styles.value, styles.feeValue]}>
            -{quote.fee.toFixed(6)} XMR
          </Paragraph>
        </View>

        <View style={[styles.quoteRow, styles.totalRow]}>
          <Paragraph style={styles.totalLabel}>You Receive:</Paragraph>
          <Paragraph style={styles.totalValue}>
            {quote.totalXmr.toFixed(6)} XMR
          </Paragraph>
        </View>

        <Paragraph style={styles.disclaimer}>
          * Rates are estimated and may change. Final amount confirmed after transaction.
        </Paragraph>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  errorCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#cccccc',
    marginTop: 8,
  },
  errorTitle: {
    color: '#ef4444',
  },
  errorText: {
    color: '#cccccc',
  },
  title: {
    color: '#ffffff',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#888888',
    textAlign: 'center',
    paddingVertical: 20,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#404040',
    paddingTop: 12,
    marginTop: 8,
  },
  label: {
    color: '#cccccc',
    flex: 1,
  },
  feeLabel: {
    color: '#f97316',
  },
  value: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  feeValue: {
    color: '#f97316',
    fontWeight: 'bold',
  },
  totalLabel: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#888888',
    fontSize: 12,
    marginTop: 16,
    fontStyle: 'italic',
  },
});
