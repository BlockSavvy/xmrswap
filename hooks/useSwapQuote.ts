import { useState, useEffect } from 'react';
import { CONFIG } from '../constants/config';
import { useTorProxy } from './useTorProxy';
import { useAppStore } from '../lib/store';

export interface SwapQuote {
  xmrAmount: number;
  fee: number;
  totalXmr: number;
  rate: number;
}

export function useSwapQuote(
  inputCrypto: 'BTC' | 'USDT',
  inputAmount: number
): {
  quote: SwapQuote | null;
  loading: boolean;
  error: string | null;
} {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { makeTorRequest } = useTorProxy();
  const { torEnabled } = useAppStore();

  useEffect(() => {
    if (inputAmount <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch real rates from CoinGecko via Tor (if enabled)
        if (torEnabled) {
          try {
            const response = await makeTorRequest(
              `${CONFIG.COINGECKO_API_BASE}/simple/price?ids=monero,${inputCrypto.toLowerCase()}&vs_currencies=usd`
            );

            if (response.ok) {
              const data = await response.json();

              const xmrPrice = data.monero?.usd;
              const inputPrice = data[inputCrypto.toLowerCase()]?.usd;

              if (xmrPrice && inputPrice) {
                const rate = inputPrice / xmrPrice; // XMR per input crypto
                const xmrAmount = inputAmount * rate;
                const feeRate = useAppStore.getState().feeRate;
                const fee = xmrAmount * feeRate;
                const totalXmr = xmrAmount - fee;

                setQuote({
                  xmrAmount,
                  fee,
                  totalXmr,
                  rate,
                });
                setLoading(false);
                return;
              }
            }
          } catch (torError) {
            console.warn('Tor request failed, falling back to mock data:', torError);
          }
        }

        // Fallback to mock data if Tor is disabled or fails
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock exchange rates (XMR per input crypto) - based on recent market data
        const mockRates = {
          BTC: 145.67, // 1 BTC = 145.67 XMR (based on ~$69k BTC and ~$475 XMR)
          USDT: 0.00685, // 1 USDT = 0.00685 XMR
        };

        const rate = mockRates[inputCrypto];
        const xmrAmount = inputAmount * rate;
        const feeRate = useAppStore.getState().feeRate;
        const fee = xmrAmount * feeRate;
        const totalXmr = xmrAmount - fee;

        setQuote({
          xmrAmount,
          fee,
          totalXmr,
          rate,
        });
      } catch (err) {
        console.error('Failed to fetch exchange rates:', err);
        setError('Failed to fetch exchange rates. Please try again.');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [inputCrypto, inputAmount, torEnabled, makeTorRequest]);

  return { quote, loading, error };
}
