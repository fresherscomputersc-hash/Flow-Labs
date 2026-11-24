import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#07090E",
        foreground: "#F8FAFC",
        surface: "rgba(16, 23, 40, 0.72)",
        "surface-card": "rgba(18, 26, 44, 0.65)",
        "surface-hover": "rgba(26, 38, 64, 0.88)",
        border: "rgba(255, 255, 255, 0.08)",
        "border-strong": "rgba(255, 255, 255, 0.16)",
        "border-glow": "rgba(6, 182, 212, 0.35)",
        neon: {
          cyan: "#06B6D4",
          blue: "#3B82F6",
          emerald: "#10B981",
          purple: "#8B5CF6",
          amber: "#F59E0B",
          rose: "#EF4444",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-body)", "DM Sans", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        dock: "0 20px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)",
        bento: "0 14px 34px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        glow: "0 0 35px -5px rgba(6, 182, 212, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
