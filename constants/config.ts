// Configuration constants for the XMR Swap app

export const CONFIG = {
  // API endpoints (will be routed through Tor in production)
  COINGECKO_API_BASE: 'https://api.coingecko.com/api/v3',

  // Monero network settings
  MONERO_NETWORK: 'mainnet', // Change to 'testnet' for testing
  MONERO_RPC_URL: 'https://node.moneroworld.com', // Public node for demo

  // Default settings
  DEFAULT_FEE_RATE: 0.015, // 1.5%
  MIN_FEE_RATE: 0.001, // 0.1%
  MAX_FEE_RATE: 0.05, // 5%

  // Swap timeouts (in milliseconds)
  SWAP_PENDING_TIMEOUT: 300000, // 5 minutes
  SWAP_CONFIRMED_TIMEOUT: 600000, // 10 minutes
  SWAP_EXECUTING_TIMEOUT: 1800000, // 30 minutes

  // UI settings
  THEME_COLORS: {
    primary: '#f97316', // Orange
    secondary: '#1f2937', // Dark gray
    background: '#0f0f0f', // Very dark
    surface: '#1a1a1a', // Dark surface
    success: '#10b981', // Green
    error: '#ef4444', // Red
    warning: '#f59e0b', // Yellow
  },

  // Security settings
  ENCRYPTION_KEY: 'xmrswap-encryption-key-2024', // In production, generate unique per user

  // App metadata
  APP_NAME: 'XMR Swap',
  APP_VERSION: '1.0.0',
  SUPPORTED_CRYPTOS: ['BTC', 'USDT'] as const,
  SUPPORTED_CHAINS: {
    BTC: 'bitcoin',
    USDT: ['ethereum', 'polygon', 'bsc'] as const,
  },
} as const;

export type SupportedCrypto = typeof CONFIG.SUPPORTED_CRYPTOS[number];
export type SupportedChain = typeof CONFIG.SUPPORTED_CHAINS.USDT[number];
