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
    },
  },
  plugins: [],
};
export default config;
