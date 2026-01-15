import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, TextInput, RadioButton, Paragraph } from 'react-native-paper';
import { router } from 'expo-router';
import { useAppStore } from '../../lib/store';
import { QuoteDisplay } from '../../components/QuoteDisplay';
import { useSwapQuote } from '../../hooks/useSwapQuote';

export default function SwapSetupScreen() {
  const { setCurrentSwap, feeRate } = useAppStore();
  const [inputCrypto, setInputCrypto] = useState<'BTC' | 'USDT'>('BTC');
  const [inputAmount, setInputAmount] = useState('');
  const [xmrReceiveAddress, setXmrReceiveAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { quote, loading: quoteLoading, error: quoteError } = useSwapQuote(
    inputCrypto,
    parseFloat(inputAmount) || 0
  );

  const handleContinue = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!xmrReceiveAddress.trim()) {
      Alert.alert('Missing Address', 'Please enter your XMR receive address.');
      return;
    }

    if (!quote) {
      Alert.alert('Quote Error', 'Unable to get quote. Please try again.');
      return;
    }

    // Validate XMR address format (basic check)
    if (!xmrReceiveAddress.startsWith('4') || xmrReceiveAddress.length !== 95) {
      Alert.alert(
        'Invalid XMR Address',
        'Please enter a valid Monero address (should start with 4 and be 95 characters long).'
      );
      return;
    }

    const swapData = {
      inputCrypto,
      inputAmount: parseFloat(inputAmount),
      xmrReceiveAddress: xmrReceiveAddress.trim(),
      quote,
    };

    setCurrentSwap(swapData);
    router.push('/swap/confirm');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Setup Swap</Title>
          <Paragraph style={styles.subtitle}>
            Select your input crypto and amount
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Input Currency</Title>
            <RadioButton.Group onValueChange={setInputCrypto} value={inputCrypto}>
              <View style={styles.radioOption}>
                <RadioButton value="BTC" color="#f97316" />
                <Paragraph style={styles.radioLabel}>Bitcoin (BTC)</Paragraph>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="USDT" color="#f97316" />
                <Paragraph style={styles.radioLabel}>Tether (USDT)</Paragraph>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Amount</Title>
            <TextInput
              label={`Amount in ${inputCrypto}`}
              value={inputAmount}
              onChangeText={setInputAmount}
              keyboardType="decimal-pad"
              style={styles.input}
              theme={{
                colors: {
                  primary: '#f97316',
                  background: '#2a2a2a',
                  surface: '#2a2a2a',
                  text: '#ffffff',
                  placeholder: '#888888',
                },
              }}
              placeholder={`Enter ${inputCrypto} amount`}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>XMR Receive Address</Title>
            <TextInput
              label="Monero Address"
              value={xmrReceiveAddress}
              onChangeText={setXmrReceiveAddress}
              style={styles.input}
              multiline
              numberOfLines={3}
              theme={{
                colors: {
                  primary: '#f97316',
                  background: '#2a2a2a',
                  surface: '#2a2a2a',
                  text: '#ffffff',
                  placeholder: '#888888',
                },
              }}
              placeholder="Enter your Monero receive address (starts with 4...)"
            />
            <Paragraph style={styles.addressHint}>
              Your XMR will be sent to this address after the swap completes.
            </Paragraph>
          </Card.Content>
        </Card>

        <QuoteDisplay
          quote={quote}
          loading={quoteLoading}
          error={quoteError}
          inputCrypto={inputCrypto}
          inputAmount={parseFloat(inputAmount) || 0}
          feeRate={feeRate}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
          >
            Back
          </Button>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            disabled={!quote || loading}
            loading={loading}
          >
            Continue
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
  card: {
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#ffffff',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    color: '#cccccc',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    marginBottom: 8,
  },
  addressHint: {
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButton: {
    flex: 1,
    borderColor: '#f97316',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#f97316',
  },
});
