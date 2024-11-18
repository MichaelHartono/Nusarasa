import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        nusa: {
          red: "#FA7070",
          darkRed: "#8C2B2B",
          beige: "#FEFDED",
          lightgreen: "#C6EBC5",
          green: "#A1C398",
        },
        cyan: {
          100: "#FEF2F2",
          300: "#FA7070",
          500: "#F75C7C",
          600: "#F73E3E",
          700: "#FA7070",
          800: "#F14242",
          900: "#DF2323",
          1000: "#BB1A1A"
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
export default config;
