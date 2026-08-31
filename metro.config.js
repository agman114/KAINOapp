const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /electron-main\.js$/,
  /server\.js$/,
  /fastScraper\.js$/,
  /playwrightScraper\.js$/,
  /scratch_.*\.js$/,
  /scratch_.*\.py$/,
];

module.exports = config;
