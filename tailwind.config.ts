import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Base backgrounds ──────────────────────────────────────
        "bg-base":     "#09090E",
        "bg-surface":  "#111118",
        "bg-elevated": "#18181F",
        "bg-overlay":  "#1E1E2A",

        // ── Borders ───────────────────────────────────────────────
        "border-dim":    "#1C1C28",
        "border-base":   "#1C1C28",
        "border-bright": "#2A2A3A",

        // ── Accents ───────────────────────────────────────────────
        "accent-primary":  "#6366F1",
        "accent-success":  "#10B981",
        "accent-warning":  "#F59E0B",
        "accent-danger":   "#EF4444",
        "revenue-green":   "#34D399",

        // ── Text ──────────────────────────────────────────────────
        "text-primary":   "#F1F1F6",
        "text-secondary": "#8B8BA0",
        "text-muted":     "#4A4A64",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-indigo":
          "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)",
        "glow-green":
          "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":  "spin 2s linear infinite",
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-sm":  "0 0 12px rgba(99,102,241,0.2)",
        "glow-md":  "0 0 24px rgba(99,102,241,0.25)",
        "card":     "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "elevated": "0 4px 6px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
