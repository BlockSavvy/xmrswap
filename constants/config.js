// Application configuration constants

export const CONFIG = {
  // API endpoints
  COINGECKO_API_BASE: 'https://api.coingecko.com/api/v3',

  // Supported cryptocurrencies
  SUPPORTED_CRYPTOS: ['BTC', 'USDT'],

  // Network configurations
  NETWORKS: {
    BTC: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
      mainnet: true,
    },
    USDT: {
      name: 'Tether',
      symbol: 'USDT',
      decimals: 6,
      mainnet: true,
    },
    XMR: {
      name: 'Monero',
      symbol: 'XMR',
      decimals: 12,
      mainnet: true,
    },
  },

  // Swap parameters
  SWAP_CONFIG: {
    MIN_AMOUNT_BTC: 0.0001,
    MIN_AMOUNT_USDT: 1,
    MAX_SWAP_TIME: 30 * 60 * 1000, // 30 minutes
    CONFIRMATIONS_REQUIRED: 1,
    FEE_RATE: 0.015, // 1.5%
    MIN_XMR_BALANCE: 5.0, // Minimum XMR to maintain in liquidity wallet
  },

  // Tor proxy settings (for privacy-focused requests)
  TOR_CONFIG: {
    enabled: true,
    proxyUrl: null, // Will be set if Tor is available
  },

  // Wallet connection settings
  WALLET_CONFIG: {
    requiredNamespaces: {
      eip155: {
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        chains: ['eip155:1'], // Ethereum mainnet
        events: ['chainChanged', 'accountsChanged'],
      },
    },
  },
};

export const SupportedCrypto = {
  BTC: 'BTC',
  USDT: 'USDT',
};
