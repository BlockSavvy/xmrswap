import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, TextInput, RadioButton, Chip } from 'react-native-paper';
// Custom navigation passed as prop
import { useAppStore } from '../lib/store';
import { useSwapQuote } from '../hooks/useSwapQuote';
import { QuoteDisplay } from '../components/QuoteDisplay';

const CRYPTO_OPTIONS = [
  { label: 'Bitcoin (BTC)', value: 'btc', icon: '₿' },
  { label: 'Tether (USDT)', value: 'usdt', icon: '₮' },
];

export default function SwapSetupScreen({ navigation }) {
  // const { wallet, settings } = useAppStore();
  const wallet = { isConnected: false }; // Mock wallet state
  const settings = { feeRate: 0.015 }; // Mock settings
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [amount, setAmount] = useState('');
  const [xmrAddress, setXmrAddress] = useState('');

  const { quote, loading, error, fetchQuote } = useSwapQuote();

  useEffect(() => {
    if (amount && selectedCrypto) {
      fetchQuote(selectedCrypto, parseFloat(amount));
    }
  }, [amount, selectedCrypto, fetchQuote]);

  const handleConfirm = () => {
    if (!amount || !xmrAddress) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    if (!quote) {
      Alert.alert('Quote Required', 'Please wait for the quote to load.');
      return;
    }

    // Validate XMR address (basic validation)
    if (!xmrAddress.startsWith('4') || xmrAddress.length !== 95) {
      Alert.alert('Invalid Address', 'Please enter a valid Monero address.');
      return;
    }

    navigation.navigate('SwapConfirm', {
      crypto: selectedCrypto,
      amount: parseFloat(amount),
      xmrAddress,
      quote,
    });
  };

  const presetAmounts = [0.01, 0.1, 1, 10];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Title style={styles.title}>Setup Your Swap</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Select Crypto to Swap</Title>
            <RadioButton.Group onValueChange={setSelectedCrypto} value={selectedCrypto}>
              {CRYPTO_OPTIONS.map((option) => (
                <View key={option.value} style={styles.radioOption}>
                  <RadioButton value={option.value} />
                  <Paragraph style={styles.radioLabel}>
                    {option.icon} {option.label}
                  </Paragraph>
                </View>
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Amount to Swap</Title>
            <TextInput
              label={`Amount (${selectedCrypto.toUpperCase()})`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
              theme={{ colors: { primary: '#f97316' } }}
            />

            <View style={styles.presetContainer}>
              <Paragraph style={styles.presetLabel}>Quick select:</Paragraph>
              <View style={styles.presetButtons}>
                {presetAmounts.map((preset) => (
                  <Chip
                    key={preset}
                    mode="outlined"
                    onPress={() => setAmount(preset.toString())}
                    style={styles.presetChip}
                    textStyle={styles.presetText}
                  >
                    {preset} {selectedCrypto.toUpperCase()}
                  </Chip>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Your XMR Receive Address</Title>
            <TextInput
              label="Monero Address"
              value={xmrAddress}
              onChangeText={setXmrAddress}
              multiline
              numberOfLines={3}
              style={styles.addressInput}
              theme={{ colors: { primary: '#f97316' } }}
            />
            <Paragraph style={styles.addressHint}>
              Enter your Monero wallet address where you want to receive XMR
            </Paragraph>
          </Card.Content>
        </Card>

        {quote && <QuoteDisplay quote={quote} />}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.confirmButton}
            disabled={!amount || !xmrAddress || !quote || loading}
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
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioLabel: {
    color: '#cccccc',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
  },
  presetContainer: {
    marginTop: 8,
  },
  presetLabel: {
    color: '#cccccc',
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    borderColor: '#f97316',
  },
  presetText: {
    color: '#f97316',
  },
  addressInput: {
    backgroundColor: '#2a2a2a',
    marginBottom: 8,
  },
  addressHint: {
    color: '#888888',
    fontSize: 12,
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
});
