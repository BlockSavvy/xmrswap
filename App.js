import React, { useState } from 'react';
import { registerRootComponent } from 'expo';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Conditionally import SafeAreaView only for native platforms
let SafeAreaView;
if (Platform.OS !== 'web') {
  SafeAreaView = require('react-native-safe-area-context').SafeAreaView;
} else {
  SafeAreaView = View; // Use regular View for web
}

// Import screens
import HomeScreen from './screens/HomeScreen';
import SwapSetupScreen from './screens/SwapSetupScreen';
import SwapConfirmScreen from './screens/SwapConfirmScreen';
import SwapStatusScreen from './screens/SwapStatusScreen';
import SettingsScreen from './screens/SettingsScreen';

const { width } = Dimensions.get('window');

const SCREENS = {
  Home: 'Home',
  SwapSetup: 'SwapSetup',
  SwapConfirm: 'SwapConfirm',
  SwapStatus: 'SwapStatus',
  Settings: 'Settings',
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.Home);
  const [navigationState, setNavigationState] = useState({});
  const [navigationStack, setNavigationStack] = useState([SCREENS.Home]);

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setNavigationState(params);
    setNavigationStack(prev => [...prev, screen]);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop();
      const previousScreen = newStack[newStack.length - 1];
      setCurrentScreen(previousScreen);
      setNavigationStack(newStack);
    } else {
      setCurrentScreen(SCREENS.Home);
    }
    setNavigationState({});
  };

  const renderScreen = () => {
    const navigation = { navigate, goBack, state: navigationState };

    switch (currentScreen) {
      case SCREENS.Home:
        return <HomeScreen navigation={navigation} />;
      case SCREENS.SwapSetup:
        return <SwapSetupScreen navigation={navigation} />;
      case SCREENS.SwapConfirm:
        return <SwapConfirmScreen navigation={navigation} />;
      case SCREENS.SwapStatus:
        return <SwapStatusScreen navigation={navigation} />;
      case SCREENS.Settings:
        return <SettingsScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {Platform.OS !== 'web' && <StatusBar style="light" backgroundColor="#0f0f0f" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
  },
});

registerRootComponent(App);
