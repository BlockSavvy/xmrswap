import { renderHook, waitFor } from '@testing-library/react-native';
import { useSwapQuote } from '../../hooks/useSwapQuote';

describe('useSwapQuote', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useSwapQuote('BTC', 0.01));

    expect(result.current.loading).toBe(true);
    expect(result.current.quote).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return null quote for zero amount', async () => {
    const { result } = renderHook(() => useSwapQuote('BTC', 0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quote).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return quote for BTC', async () => {
    const { result } = renderHook(() => useSwapQuote('BTC', 0.01));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quote).not.toBeNull();
    expect(result.current.quote?.xmrAmount).toBeGreaterThan(0);
    expect(result.current.quote?.rate).toBeGreaterThan(0);
    expect(result.current.quote?.fee).toBeGreaterThan(0);
    expect(result.current.quote?.totalXmr).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('should return quote for USDT', async () => {
    const { result } = renderHook(() => useSwapQuote('USDT', 10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.quote).not.toBeNull();
    expect(result.current.quote?.xmrAmount).toBeGreaterThan(0);
    expect(result.current.quote?.rate).toBeGreaterThan(0);
    expect(result.current.quote?.fee).toBeGreaterThan(0);
    expect(result.current.quote?.totalXmr).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });
});
