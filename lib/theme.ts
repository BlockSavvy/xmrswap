import { MD3DarkTheme } from 'react-native-paper';

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#f97316', // Orange for Monero branding
    secondary: '#1f2937', // Dark gray
    background: '#0f0f0f', // Very dark background
    surface: '#1a1a1a', // Slightly lighter dark surface
    surfaceVariant: '#2a2a2a',
    onSurface: '#ffffff',
    onSurfaceVariant: '#cccccc',
    error: '#ef4444',
    onError: '#ffffff',
    outline: '#404040',
  },
  roundness: 8,
};
