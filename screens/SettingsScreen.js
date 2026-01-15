import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, TextInput, Switch, Divider } from 'react-native-paper';
// Custom navigation passed as prop
import { useAppStore } from '../lib/store';
import * as SecureStore from 'expo-secure-store';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings } = useAppStore();
  const [feeRate, setFeeRate] = useState(settings.feeRate.toString());
  const [xmrSeed, setXmrSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);

  const handleSaveSettings = () => {
    const newFeeRate = parseFloat(feeRate);
    if (isNaN(newFeeRate) || newFeeRate < 0 || newFeeRate > 0.1) {
      Alert.alert('Invalid Fee Rate', 'Fee rate must be between 0% and 10%.');
      return;
    }

    updateSettings({ feeRate: newFeeRate });
    Alert.alert('Settings Saved', 'Your settings have been updated.');
  };

  const handleSaveSeed = async () => {
    if (!xmrSeed || xmrSeed.length < 100) {
      Alert.alert('Invalid Seed', 'Please enter a valid Monero seed phrase.');
      return;
    }

    try {
      await SecureStore.setItemAsync('xmr_seed', xmrSeed);
      Alert.alert('Seed Saved', 'Your Monero seed has been securely stored.');
      setXmrSeed('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save seed. Please try again.');
    }
  };

  const handleLoadSeed = async () => {
    try {
      const seed = await SecureStore.getItemAsync('xmr_seed');
      if (seed) {
        setXmrSeed(seed);
        setShowSeed(true);
      } else {
        Alert.alert('No Seed Found', 'No Monero seed is stored.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load seed.');
    }
  };

  const handleClearSeed = async () => {
    Alert.alert(
      'Clear Seed',
      'Are you sure you want to remove the stored Monero seed? Make sure you have backed it up.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('xmr_seed');
              setXmrSeed('');
              setShowSeed(false);
              Alert.alert('Seed Cleared', 'The stored seed has been removed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear seed.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Title style={styles.title}>Settings</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Exchange Settings</Title>

            <View style={styles.settingRow}>
              <Paragraph style={styles.settingLabel}>Fee Rate (%)</Paragraph>
              <TextInput
                value={feeRate}
                onChangeText={setFeeRate}
                keyboardType="numeric"
                style={styles.feeInput}
                theme={{ colors: { primary: '#f97316' } }}
              />
            </View>

            <Paragraph style={styles.settingDescription}>
              Service fee charged on XMR amount (default: 1.5%)
            </Paragraph>

            <Button
              mode="contained"
              onPress={handleSaveSettings}
              style={styles.saveButton}
            >
              Save Settings
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Monero Wallet</Title>
            <Paragraph style={styles.walletDescription}>
              Store your Monero seed phrase securely for liquidity provision.
              This is used to generate addresses and sign transactions.
            </Paragraph>

            <View style={styles.seedSection}>
              <TextInput
                label="Monero Seed Phrase"
                value={xmrSeed}
                onChangeText={setXmrSeed}
                multiline
                numberOfLines={3}
                secureTextEntry={!showSeed}
                style={styles.seedInput}
                theme={{ colors: { primary: '#f97316' } }}
              />

              <View style={styles.seedButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowSeed(!showSeed)}
                  style={styles.seedButton}
                >
                  {showSeed ? 'Hide' : 'Show'}
                </Button>

                <Button
                  mode="outlined"
                  onPress={handleLoadSeed}
                  style={styles.seedButton}
                >
                  Load
                </Button>

                <Button
                  mode="outlined"
                  onPress={handleClearSeed}
                  style={[styles.seedButton, { borderColor: '#ef4444' }]}
                  textColor="#ef4444"
                >
                  Clear
                </Button>
              </View>

              <Button
                mode="contained"
                onPress={handleSaveSeed}
                style={styles.saveSeedButton}
                disabled={!xmrSeed}
              >
                Save Seed
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Privacy & Security</Title>

            <View style={styles.privacySection}>
              <View style={styles.privacyRow}>
                <Paragraph style={styles.privacyLabel}>Tor Network</Paragraph>
                <Switch
                  value={settings.useTor}
                  onValueChange={(value) => updateSettings({ useTor: value })}
                  color="#f97316"
                />
              </View>
              <Paragraph style={styles.privacyDescription}>
                Route all network requests through Tor for maximum privacy
              </Paragraph>

              <Divider style={styles.divider} />

              <View style={styles.privacyRow}>
                <Paragraph style={styles.privacyLabel}>Secure Storage</Paragraph>
                <Switch
                  value={settings.secureStorage}
                  onValueChange={(value) => updateSettings({ secureStorage: value })}
                  color="#f97316"
                />
              </View>
              <Paragraph style={styles.privacyDescription}>
                Use encrypted storage for sensitive data
              </Paragraph>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            Close
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    color: '#cccccc',
    flex: 1,
  },
  feeInput: {
    backgroundColor: '#2a2a2a',
    flex: 1,
    marginLeft: 16,
  },
  settingDescription: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#f97316',
  },
  walletDescription: {
    color: '#cccccc',
    marginBottom: 16,
  },
  seedSection: {
    marginTop: 16,
  },
  seedInput: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
  },
  seedButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  seedButton: {
    flex: 1,
    borderColor: '#f97316',
  },
  saveSeedButton: {
    backgroundColor: '#f97316',
  },
  privacySection: {
    marginTop: 16,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  privacyLabel: {
    color: '#cccccc',
  },
  privacyDescription: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 16,
  },
  divider: {
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  closeButton: {
    borderColor: '#666666',
  },
});
