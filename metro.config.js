const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block the project's own compiled dist/ output only — NOT node_modules dist dirs
config.resolver.blockList = [/^(?!.*node_modules).*\/dist\/.*/];

module.exports = config;
