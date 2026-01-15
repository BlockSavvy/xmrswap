import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';

export function QuoteDisplay({ quote, loading }) {
  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.centered}>
          <ActivityIndicator animating={true} color="#f97316" />
          <Paragraph style={styles.loadingText}>Getting quote...</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  if (!quote) return null;

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.title}>Swap Quote</Title>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>You'll receive:</Paragraph>
          <Paragraph style={styles.value}>{quote.expectedXmr} XMR</Paragraph>
        </View>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>Exchange Rate:</Paragraph>
          <Paragraph style={styles.value}>
            1 {quote.inputCrypto?.toUpperCase() || 'BTC'} = {quote.rate} XMR
          </Paragraph>
        </View>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>Service Fee:</Paragraph>
          <Paragraph style={styles.value}>
            {quote.fee} XMR ({quote.feePercentage}%)
          </Paragraph>
        </View>

        <View style={styles.quoteRow}>
          <Paragraph style={styles.label}>Expires in:</Paragraph>
          <Paragraph style={styles.value}>{quote.expiresIn || '10 minutes'}</Paragraph>
        </View>

        <Paragraph style={styles.disclaimer}>
          ⚠️ Rates are estimates and may change. Confirm swap within expiration time.
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
  centered: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#cccccc',
    marginTop: 8,
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    color: '#cccccc',
    flex: 1,
  },
  value: {
    color: '#ffffff',
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  disclaimer: {
    color: '#f97316',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: 'bold',
  },
});
