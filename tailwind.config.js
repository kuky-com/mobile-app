/** @type {import('tailwindcss').Config} */
import colors from "./src/utils/colors";
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
  corePlugin: {
    backgroundOpacity: true,
  },
};
