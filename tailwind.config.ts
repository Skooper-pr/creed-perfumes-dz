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
        primary: {
          DEFAULT: "#541f91",
          container: "#6c3baa",
          hover: "#451677",
          fixed: "#eedcff",
          dim: "#d8b9ff",
        },
        secondary: {
          DEFAULT: "#f47a60",
          dark: "#a23d28",
          container: "#fe8267",
          fixed: "#ffdad3",
          light: "#fff1ee",
        },
        tertiary: {
          DEFAULT: "#593710",
          container: "#744e25",
          fixed: "#ffdcbd",
          dim: "#f0bd8b",
        },
        surface: {
          DEFAULT: "#fff7ff",
          dim: "#e3d5ee",
          bright: "#fff7ff",
          container: "#f6e9ff",
          "container-low": "#faf0ff",
          "container-high": "#f1e3fc",
          "container-highest": "#ebddf7",
          "container-lowest": "#ffffff",
        },
        "on-surface": "#20182a",
        "on-surface-variant": "#4b4452",
        "on-primary": "#ffffff",
        "on-primary-container": "#dcbfff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#731b09",
        outline: "#7c7483",
        "outline-variant": "#cdc3d3",
        "inverse-surface": "#352d40",
        "inverse-on-surface": "#f8edff",
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "var(--font-jakarta)", "sans-serif"],
        display: ["var(--font-cairo)", "var(--font-jakarta)", "sans-serif"],
      },
      boxShadow: {
        stitch: "0px 8px 24px -4px rgba(108, 59, 170, 0.08)",
        "stitch-hover": "0px 14px 32px -4px rgba(108, 59, 170, 0.16)",
        "stitch-glow": "0px 8px 24px rgba(108, 59, 170, 0.32)",
        "stitch-coral": "0px 8px 24px rgba(244, 122, 96, 0.35)",
        "stitch-floating": "0px 12px 32px -6px rgba(108, 59, 170, 0.28)",
      },
      borderRadius: {
        full: "9999px",
        "4xl": "2rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1deg)" },
        },
        "float-reverse": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(10px) rotate(-1deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.02)" },
        },
        "shadow-scale": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.2" },
          "50%": { transform: "scale(0.82)", opacity: "0.1" },
        },
        "aura-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.2" },
          "50%": { transform: "scale(1.2)", opacity: "0.38" },
        },
        "badge-pop": {
          "0%": { transform: "scale(0.85)" },
          "45%": { transform: "scale(1.28)" },
          "70%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-reverse": "float-reverse 6s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "shadow-scale": "shadow-scale 5s ease-in-out infinite",
        "aura-pulse": "aura-pulse 4s ease-in-out infinite",
        "badge-pop": "badge-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        shimmer: "shimmer 2.5s infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
