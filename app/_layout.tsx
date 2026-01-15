import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../lib/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0f0f0f' },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'XMR Swap',
            }}
          />
          <Stack.Screen
            name="swap/[id]"
            options={{
              title: 'Swap Status',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: 'Settings',
              presentation: 'modal',
            }}
          />
        </Stack>
        <StatusBar style="light" backgroundColor="#0f0f0f" />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
