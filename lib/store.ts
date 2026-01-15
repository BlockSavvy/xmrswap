import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Swap {
  id: string;
  inputCrypto: string;
  inputAmount: number;
  expectedXmr: string;
  xmrAddress: string;
  status: 'pending' | 'confirming' | 'swapping' | 'completing' | 'completed' | 'failed' | 'refunded';
  quote: any;
  createdAt: string;
  txHash?: string;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  network?: string;
}

interface AppState {
  // Swap state
  currentSwap: Partial<Swap> | null;
  swaps: Swap[];

  // Wallet state
  wallet: WalletState;

  // Settings
  settings: {
    feeRate: number;
    useTor: boolean;
    secureStorage: boolean;
  };

  // Actions
  setCurrentSwap: (swap: Partial<Swap> | null) => void;
  addSwap: (swap: Swap) => void;
  updateSwap: (swap: Swap) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSwap: null,
      swaps: [],
      wallet: {
        isConnected: false,
      },
      settings: {
        feeRate: 0.015,
        useTor: true,
        secureStorage: true,
      },

      // Actions
      setCurrentSwap: (swap) => set({ currentSwap: swap }),

      addSwap: (swap) => set((state) => ({
        swaps: [...state.swaps, swap]
      })),

      updateSwap: (swap) => set((state) => ({
        swaps: state.swaps.map(s =>
          s.id === swap.id ? { ...s, ...swap } : s
        )
      })),

      connectWallet: async () => {
        // Mock wallet connection - replace with real WalletConnect
        set({
          wallet: {
            isConnected: true,
            address: '0x1234567890abcdef',
            network: 'Ethereum',
          }
        });
      },

      disconnectWallet: () => set({
        wallet: { isConnected: false }
      }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'xmrswap-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      // Don't persist sensitive data
      partialize: (state) => ({
        settings: state.settings,
        swaps: state.swaps,
      }),
    }
  )
);

// For Redux compatibility (temporary)
export const store = {
  getState: () => ({}),
  dispatch: () => {},
  subscribe: () => () => {},
};
