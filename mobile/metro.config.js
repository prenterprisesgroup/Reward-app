const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce memory usage by limiting workers
config.maxWorkers = 1;
config.resetCache = true;

// Add support for react-native-reanimated
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

module.exports = config;
