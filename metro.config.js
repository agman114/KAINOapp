const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /electron-main\.js$/,
  /server\.js$/,
  /playwrightScraper\.js$/,
  /scratch_.*\.js$/,
];

module.exports = config;
