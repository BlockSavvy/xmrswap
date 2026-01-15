// Error handling utilities for XMR Swap

export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  WALLET_ERROR: 'WALLET_ERROR',
  SWAP_ERROR: 'SWAP_ERROR',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export class SwapError extends Error {
  constructor(type, message, userMessage, recoverable = true, data = {}) {
    super(message);
    this.type = type;
    this.userMessage = userMessage;
    this.recoverable = recoverable;
    this.data = data;
  }
}

export function createError(type, message, data = {}) {
  const userMessages = {
    [ErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
    [ErrorType.VALIDATION_ERROR]: 'Invalid input data. Please check your entries.',
    [ErrorType.WALLET_ERROR]: 'Wallet connection failed. Please try reconnecting.',
    [ErrorType.SWAP_ERROR]: 'Swap failed. Your funds are safe and may be refunded.',
    [ErrorType.INVALID_ADDRESS]: 'Invalid cryptocurrency address format.',
    [ErrorType.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
    [ErrorType.TIMEOUT_ERROR]: 'Operation timed out. Please try again.',
    [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  };

  return new SwapError(
    type,
    message,
    userMessages[type] || userMessages[ErrorType.UNKNOWN_ERROR],
    true,
    data
  );
}

export function handleError(error) {
  if (error instanceof SwapError) {
    return error;
  }

  // Handle common error types
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    return createError(ErrorType.NETWORK_ERROR, error.message);
  }

  if (error.message?.includes('timeout')) {
    return createError(ErrorType.TIMEOUT_ERROR, error.message);
  }

  // Default to unknown error
  return createError(ErrorType.UNKNOWN_ERROR, error.message || 'Unknown error');
}

export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }

  throw handleError(lastError);
}

export function validateXmrAddress(address) {
  // Basic XMR address validation
  // Real implementation would use a proper XMR address validation library
  if (!address || typeof address !== 'string') {
    return false;
  }

  // XMR addresses start with 4 or 8 and are 95 characters long
  return (address.startsWith('4') || address.startsWith('8')) && address.length === 95;
}

export function validateAmount(amount, minAmount = 0) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }

  return amount > minAmount;
}

export function validateCryptoAddress(address, crypto) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  switch (crypto.toUpperCase()) {
    case 'BTC':
      // Basic BTC address validation
      return address.length >= 26 && address.length <= 62;
    case 'USDT':
      // Basic ETH address validation
      return address.startsWith('0x') && address.length === 42;
    default:
      return false;
  }
}
