import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph, TextInput, Switch, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useAppStore } from '../lib/store';

export default function SettingsScreen() {
  const { feeRate, xmrWalletSeed, torEnabled, setFeeRate, setXmrWalletSeed, setTorEnabled } = useAppStore();
  const [newFeeRate, setNewFeeRate] = useState((feeRate * 100).toString());
  const [newSeed, setNewSeed] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Validate fee rate
      const feeNum = parseFloat(newFeeRate);
      if (isNaN(feeNum) || feeNum < 0.1 || feeNum > 5) {
        Alert.alert('Invalid Fee Rate', 'Fee rate must be between 0.1% and 5%.');
        return;
      }

      // Update settings
      setFeeRate(feeNum / 100);

      if (newSeed.trim()) {
        setXmrWalletSeed(newSeed.trim());
        setNewSeed('');
        Alert.alert('Success', 'Settings saved successfully.');
      } else {
        Alert.alert('Success', 'Settings saved successfully.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Settings</Title>
          <Paragraph style={styles.subtitle}>
            Configure your swap preferences
          </Paragraph>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Service Configuration</Title>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Paragraph style={styles.settingLabel}>Service Fee Rate</Paragraph>
                <Paragraph style={styles.settingDescription}>
                  Percentage fee charged on XMR swaps (0.1% - 5%)
                </Paragraph>
              </View>
              <TextInput
                value={newFeeRate}
                onChangeText={setNewFeeRate}
                keyboardType="decimal-pad"
                style={styles.feeInput}
                theme={{
                  colors: {
                    primary: '#f97316',
                    background: '#2a2a2a',
                    surface: '#2a2a2a',
                    text: '#ffffff',
                    placeholder: '#888888',
                  },
                }}
                right={<TextInput.Affix text="%" />}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Paragraph style={styles.settingLabel}>Tor Network</Paragraph>
                <Paragraph style={styles.settingDescription}>
                  Route all network requests through Tor for maximum privacy
                </Paragraph>
              </View>
              <Switch
                value={torEnabled}
                onValueChange={setTorEnabled}
                color="#f97316"
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>XMR Liquidity Wallet</Title>
            <Paragraph style={styles.walletDescription}>
              Configure your Monero wallet seed for providing liquidity. This wallet will hold XMR for swaps.
            </Paragraph>

            <View style={styles.seedSection}>
              <Paragraph style={styles.seedLabel}>Current Status:</Paragraph>
              <Paragraph style={[styles.seedStatus, { color: xmrWalletSeed ? '#10b981' : '#ef4444' }]}>
                {xmrWalletSeed ? 'Configured' : 'Not Configured'}
              </Paragraph>
            </View>

            <TextInput
              label="New Wallet Seed (25 words)"
              value={newSeed}
              onChangeText={setNewSeed}
              multiline
              numberOfLines={3}
              secureTextEntry={!showSeed}
              style={styles.seedInput}
              theme={{
                colors: {
                  primary: '#f97316',
                  background: '#2a2a2a',
                  surface: '#2a2a2a',
                  text: '#ffffff',
                  placeholder: '#888888',
                },
              }}
              placeholder="Enter your 25-word Monero seed phrase..."
            />

            <View style={styles.seedActions}>
              <Button
                mode="outlined"
                onPress={() => setShowSeed(!showSeed)}
                style={styles.showButton}
              >
                {showSeed ? 'Hide' : 'Show'} Seed
              </Button>
            </View>

            <Paragraph style={styles.seedWarning}>
              ⚠️ Never share your seed phrase. Store it securely. This app encrypts sensitive data locally.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Title style={styles.warningTitle}>⚠️ Mainnet Warning</Title>
            <Paragraph style={styles.warningText}>
              This service operates on Monero mainnet. All transactions are real and irreversible.
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Ensure your XMR wallet seed is backed up
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • Test with small amounts first
            </Paragraph>
            <Paragraph style={styles.warningText}>
              • You are responsible for any lost funds
            </Paragraph>
          </Card.Content>
        </Card>

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
            onPress={handleSaveSettings}
            style={styles.saveButton}
            loading={saving}
            disabled={saving}
          >
            Save Settings
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
  warningCard: {
    backgroundColor: '#2a1810',
    borderLeftWidth: 4,
    borderLeftColor: '#f97316',
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingDescription: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 4,
  },
  feeInput: {
    width: 80,
    marginLeft: 16,
  },
  divider: {
    backgroundColor: '#404040',
    marginVertical: 16,
  },
  walletDescription: {
    color: '#cccccc',
    marginBottom: 16,
  },
  seedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  seedLabel: {
    color: '#cccccc',
    marginRight: 8,
  },
  seedStatus: {
    fontWeight: 'bold',
  },
  seedInput: {
    backgroundColor: '#2a2a2a',
    marginBottom: 8,
  },
  seedActions: {
    marginBottom: 16,
  },
  showButton: {
    borderColor: '#f97316',
  },
  seedWarning: {
    color: '#f97316',
    fontSize: 12,
    fontStyle: 'italic',
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
  saveButton: {
    flex: 2,
    backgroundColor: '#f97316',
  },
});
