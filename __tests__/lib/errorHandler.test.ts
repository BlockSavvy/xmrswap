import { ErrorType, SwapError, createError, handleError, validateXmrAddress, validateAmount } from '../../lib/errorHandler';

describe('Error Handler', () => {
  describe('createError', () => {
    it('should create a SwapError with correct properties', () => {
      const error = createError(
        ErrorType.NETWORK_ERROR,
        'Network failed',
        { code: 500 },
        true
      );

      expect(error).toBeInstanceOf(SwapError);
      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.details).toEqual({ code: 500 });
      expect(error.recoverable).toBe(true);
      expect(error.userMessage).toBe('Network connection failed. Please check your internet connection.');
    });
  });

  describe('handleError', () => {
    it('should return SwapError as-is', () => {
      const originalError = createError(ErrorType.WALLET_ERROR, 'Wallet failed');
      const handledError = handleError(originalError);

      expect(handledError).toBe(originalError);
    });

    it('should classify network errors', () => {
      const networkError = new Error('Failed to fetch data from network');
      const handledError = handleError(networkError);

      expect(handledError.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should classify wallet errors', () => {
      const walletError = new Error('Wallet connection failed');
      const handledError = handleError(walletError);

      expect(handledError.type).toBe(ErrorType.WALLET_ERROR);
    });

    it('should classify timeout errors', () => {
      const timeoutError = new Error('Operation timed out');
      const handledError = handleError(timeoutError);

      expect(handledError.type).toBe(ErrorType.TIMEOUT_ERROR);
    });

    it('should default to unknown error', () => {
      const unknownError = new Error('Some random error');
      const handledError = handleError(unknownError);

      expect(handledError.type).toBe(ErrorType.UNKNOWN_ERROR);
    });
  });

  describe('validateXmrAddress', () => {
    it('should validate correct XMR addresses', () => {
      const validAddress = '4ExampleAddress1234567890abcdefghijklmnopqrstuvwx'; // Mock 95-char address
      expect(validateXmrAddress(validAddress)).toBe(true);
    });

    it('should reject invalid XMR addresses', () => {
      expect(validateXmrAddress('')).toBe(false);
      expect(validateXmrAddress('3InvalidAddress')).toBe(false);
      expect(validateXmrAddress('4Short')).toBe(false);
      expect(validateXmrAddress('4AddressWithInvalidChars!@#')).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should validate amounts within range', () => {
      expect(validateAmount(1.0)).toBe(true);
      expect(validateAmount(0.000001)).toBe(true);
      expect(validateAmount(1000000)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-1)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
      expect(validateAmount(1000001)).toBe(false);
    });
  });
});
