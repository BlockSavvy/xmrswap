const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom metro configuration here
config.resolver.assetExts.push('wasm'); // For WebAssembly support (future atomic swap protocols)

// Configure Metro to handle ES modules better
config.resolver.sourceExts = ['mjs', 'js', 'jsx', 'ts', 'tsx', 'json'];

// Add resolver for problematic packages
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  // Fallback for ES module issues
};

// Transformer configuration to handle ES modules
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Web-specific configuration to handle ES modules
config.web = {
  ...config.web,
  buildType: 'development',
};

// Resolver configuration for web platform
config.resolver = {
  ...config.resolver,
  alias: {
    // Handle problematic ES module imports
    'crypto': false,
    'fs': false,
    'path': false,
    'os': false,
  },
  sourceExts: ['mjs', 'js', 'jsx', 'ts', 'tsx', 'json'],
};

module.exports = config;
