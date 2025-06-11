const MODULE_RESOLVER = [
  "module-resolver",
  {
    root: ["."],
    alias: {
      "@": "./src",
    },
  },
];

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "module:metro-react-native-babel-preset",
      "nativewind/babel", // nếu bạn đang dùng Tailwind
    ],
    plugins: [
      MODULE_RESOLVER,
      ["@babel/plugin-transform-private-methods", { loose: true }],
      "react-native-reanimated/plugin", // Luôn để plugin này cuối cùng
    ],
  };
};
