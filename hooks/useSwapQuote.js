import { useState, useCallback } from 'react';
import { useAppStore } from '../lib/store';

export function useSwapQuote() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { settings } = useAppStore();

  const fetchQuote = useCallback(async (crypto, amount) => {
    if (!crypto || !amount || amount <= 0) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with real CoinGecko API
      // In production, this should route through Tor for privacy
      const mockRates = {
        BTC: 150, // 1 BTC = 150 XMR
        USDT: 0.00667, // 1 USDT = ~0.00667 XMR
      };

      const rate = mockRates[crypto.toUpperCase()];
      if (!rate) {
        throw new Error(`Unsupported crypto: ${crypto}`);
      }

      const expectedXmr = (amount * rate).toFixed(6);
      const fee = (amount * rate * settings.feeRate).toFixed(6);
      const feePercentage = (settings.feeRate * 100).toFixed(2);

      const quoteData = {
        inputCrypto: crypto,
        expectedXmr,
        rate,
        fee,
        feePercentage: parseFloat(feePercentage),
        expiresIn: '10 minutes',
        timestamp: Date.now(),
      };

      setQuote(quoteData);
    } catch (err) {
      setError(err.message);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [settings.feeRate]);

  return {
    quote,
    loading,
    error,
    fetchQuote,
  };
}
