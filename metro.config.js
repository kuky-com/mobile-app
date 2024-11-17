// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Extend asset extensions to support Lottie files and other .json assets if necessary
  config.resolver.assetExts.push("gif");

  return withNativeWind(config, { input: "./global.css" });
})();
