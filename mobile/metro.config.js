const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce memory usage by limiting workers
config.maxWorkers = 1;
config.resetCache = true;

// Add support for react-native-reanimated
config.resolver.sourceExts = [...new Set([...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'mjs', 'cjs'])];

module.exports = config;
