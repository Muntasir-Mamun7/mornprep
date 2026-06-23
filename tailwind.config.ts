import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
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
      animation: {
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "blob": "blob 7s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "toast": "toast 3s ease-in-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(3deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(-2deg)" },
        },
        blob: {
          "0%, 100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        toast: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "10%": { opacity: "1", transform: "translateY(0)" },
          "80%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
