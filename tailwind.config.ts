import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // High-end restrained luxury boutique palette
        primary: {
          DEFAULT: "#151515", // Noir / Deep Charcoal
          container: "#242424",
          hover: "#2c2c2c",
          fixed: "#F7F4EE",
          dim: "#3A3A3A",
        },
        secondary: {
          DEFAULT: "#6E603F", // Antique Bronze / Olive Gold
          dark: "#53482F",
          container: "#8A7950",
          fixed: "#F3EFE6",
          light: "#FAF8F5",
        },
        accent: {
          DEFAULT: "#B89B5E", // Muted Champagne Gold
          light: "#D8C395",
          dark: "#8C733E",
          subtle: "#F5EFE0",
        },
        tertiary: {
          DEFAULT: "#6E603F",
          container: "#8A7950",
          fixed: "#F3EFE6",
          dim: "#A39268",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dim: "#EFECE4",
          bright: "#FFFFFF",
          container: "#F7F4EE", // Warm alabaster / luxury paper
          "container-low": "#FAF8F5",
          "container-high": "#EFECE4",
          "container-highest": "#E5E0D5",
          "container-lowest": "#FFFFFF",
        },
        "on-surface": "#151515",
        "on-surface-variant": "#77736B", // Warm taupe gray
        "on-primary": "#FFFFFF",
        "on-primary-container": "#F7F4EE",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#FFFFFF",
        outline: "#B8B2A6",
        "outline-variant": "#E5E0D5",
        "inverse-surface": "#151515",
        "inverse-on-surface": "#F7F4EE",
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "var(--font-jakarta)", "sans-serif"],
        display: ["var(--font-cairo)", "var(--font-jakarta)", "sans-serif"],
      },
      boxShadow: {
        // Subtle, high-end editorial shadows
        luxury: "0 1px 3px rgba(21, 21, 21, 0.04), 0 4px 16px -2px rgba(21, 21, 21, 0.05)",
        "luxury-hover": "0 2px 6px rgba(21, 21, 21, 0.04), 0 12px 28px -4px rgba(21, 21, 21, 0.08)",
        "luxury-gold": "0 4px 20px -2px rgba(184, 155, 94, 0.18)",
        // Aliases for smooth transition
        stitch: "0 1px 3px rgba(21, 21, 21, 0.04), 0 4px 16px -2px rgba(21, 21, 21, 0.05)",
        "stitch-hover": "0 2px 6px rgba(21, 21, 21, 0.04), 0 12px 28px -4px rgba(21, 21, 21, 0.08)",
        "stitch-glow": "0 4px 20px -2px rgba(21, 21, 21, 0.15)",
        "stitch-coral": "0 4px 16px rgba(184, 155, 94, 0.2)",
        "stitch-floating": "0 8px 24px -4px rgba(21, 21, 21, 0.08)",
      },
      borderRadius: {
        full: "9999px",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "badge-pop": {
          "0%": { transform: "scale(0.92)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out forwards",
        "badge-pop": "badge-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
