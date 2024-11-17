const MODULE_RESOLVER = [
  "module-resolver",
  {
    root: ["."],
    alias: {
      "@": "./src",
    },
  },
];

module.exports = {
  presets: ["module:metro-react-native-babel-preset", "nativewind/babel"],
  plugins: [
    MODULE_RESOLVER,
    "react-native-reanimated/plugin",
    ["@babel/plugin-transform-private-methods", { loose: true }],
  ],
};
