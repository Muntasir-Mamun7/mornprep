import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f9edd9",
          200: "#f2d8b0",
          300: "#e9bd7e",
          400: "#df9c4a",
          500: "#d4802a",
          600: "#b86420",
          700: "#994b1e",
          800: "#7d3d1f",
          900: "#67331c",
          950: "#38190c",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e3eae3",
          200: "#c7d5c8",
          300: "#a1b8a3",
          400: "#76957a",
          500: "#567a5b",
          600: "#426147",
          700: "#364e3a",
          800: "#2d3f30",
          900: "#263429",
          950: "#121c14",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
