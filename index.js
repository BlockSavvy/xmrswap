import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Import different components based on platform
let App;
if (Platform.OS === 'web') {
  // Web-specific app that avoids problematic imports
  App = require('./App.web').default;
} else {
  // Native app
  App = require('./App').default;
}

registerRootComponent(App);
