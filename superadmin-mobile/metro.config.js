const { getDefaultConfig } = require('expo/metro-config');

const path = require('path');
const config = getDefaultConfig(__dirname);

// Watch the shared folder
config.watchFolders = [path.resolve(__dirname, '../shared')];

// Let shared folder resolve modules from superadmin-mobile/node_modules
config.resolver.nodeModulesPaths = [path.resolve(__dirname, 'node_modules')];

// Reduce memory usage by limiting workers
config.maxWorkers = 1;
config.resetCache = true;

// Add support for react-native-reanimated
config.resolver.sourceExts = [...new Set([...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'mjs', 'cjs'])];

module.exports = config;
