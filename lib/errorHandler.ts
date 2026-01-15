// Comprehensive error handling for XMR Swap app

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  SWAP_ERROR = 'SWAP_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  TOR_ERROR = 'TOR_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
  userMessage: string;
  action?: {
    label: string;
    handler: () => void;
  };
}

export class SwapError extends Error {
  public readonly type: ErrorType;
  public readonly details?: any;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly action?: AppError['action'];

  constructor(error: Omit<AppError, 'userMessage'> & { userMessage?: string }) {
    super(error.message);
    this.name = 'SwapError';
    this.type = error.type;
    this.details = error.details;
    this.recoverable = error.recoverable;
    this.userMessage = error.userMessage || error.message;
    this.action = error.action;
  }
}

export const ErrorMessages = {
  [ErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ErrorType.WALLET_ERROR]: 'Wallet connection error. Please reconnect your wallet.',
  [ErrorType.SWAP_ERROR]: 'Swap execution failed. Your funds are safe.',
  [ErrorType.VALIDATION_ERROR]: 'Invalid input data. Please check your entries.',
  [ErrorType.TIMEOUT_ERROR]: 'Operation timed out. Please try again.',
  [ErrorType.INSUFFICIENT_FUNDS]: 'Insufficient funds for this transaction.',
  [ErrorType.INVALID_ADDRESS]: 'Invalid cryptocurrency address format.',
  [ErrorType.TOR_ERROR]: 'Tor connection failed. Privacy features may be limited.',
  [ErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

export function createError(
  type: ErrorType,
  message: string,
  details?: any,
  recoverable: boolean = true,
  action?: AppError['action']
): SwapError {
  return new SwapError({
    type,
    message,
    details,
    recoverable,
    userMessage: ErrorMessages[type],
    action,
  });
}

export function handleError(error: unknown): SwapError {
  if (error instanceof SwapError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to classify the error based on message patterns
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return createError(ErrorType.NETWORK_ERROR, error.message, error);
    }

    if (message.includes('wallet') || message.includes('address')) {
      return createError(ErrorType.WALLET_ERROR, error.message, error);
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return createError(ErrorType.TIMEOUT_ERROR, error.message, error);
    }

    if (message.includes('insufficient') || message.includes('balance')) {
      return createError(ErrorType.INSUFFICIENT_FUNDS, error.message, error);
    }

    if (message.includes('invalid') && message.includes('address')) {
      return createError(ErrorType.INVALID_ADDRESS, error.message, error);
    }

    if (message.includes('tor')) {
      return createError(ErrorType.TOR_ERROR, error.message, error);
    }
  }

  return createError(
    ErrorType.UNKNOWN_ERROR,
    error instanceof Error ? error.message : 'Unknown error occurred',
    error
  );
}

export function logError(error: SwapError, context?: string) {
  const logData = {
    type: error.type,
    message: error.message,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    recoverable: error.recoverable,
  };

  // In development, log to console
  if (__DEV__) {
    console.error('Swap Error:', logData);
  }

  // In production, this would send to error reporting service
  // but we avoid logging sensitive data for privacy
}

// Utility function for retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw handleError(lastError);
}

// Validation utilities
export function validateXmrAddress(address: string): boolean {
  // Basic Monero address validation (starts with 4, 95 characters)
  return address.startsWith('4') && address.length === 95 && /^[4-9A-Za-z]+$/.test(address);
}

export function validateBtcAddress(address: string): boolean {
  // Basic BTC address validation (starts with 1, 3, or bc1)
  return (
    (address.startsWith('1') || address.startsWith('3')) && address.length >= 26 && address.length <= 35 ||
    address.startsWith('bc1') && address.length >= 14 && address.length <= 74
  );
}

export function validateEthAddress(address: string): boolean {
  // Basic ETH address validation (0x + 40 hex chars)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateAmount(amount: number, min: number = 0.000001, max: number = 1000000): boolean {
  return !isNaN(amount) && amount >= min && amount <= max;
}
