/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm ledger-paper neutrals — replaces the cool zinc ramp everywhere
        // zinc-* is used, so every list/table/form inherits this automatically.
        zinc: {
          50: "#faf6ee",
          100: "#f2ece0",
          200: "#e6ddc8",
          300: "#d6c9ac",
          400: "#b4a886",
          500: "#8a8265",
          600: "#6b6449",
          700: "#554f3b",
          800: "#3a362a",
          900: "#221c11"
        },
        // Petróleo ink-blue accent — replaces the generic SaaS indigo
        indigo: {
          50: "#eaf0f3",
          400: "#6f94a6",
          500: "#567f93",
          600: "#2c4a5e",
          700: "#1d3441",
          950: "#0e1a20"
        },
        // Carimbo brick-red — muted, warmer than stock red
        red: {
          50: "#fbeeea",
          300: "#e3a48f",
          500: "#ba5b3e",
          600: "#9a4630"
        },
        // Quadro-verde — muted, warmer than stock emerald
        emerald: {
          50: "#eaf3ec",
          600: "#3f6b4e",
          700: "#325a3f"
        }
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      keyframes: {
        "overlay-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" }
        },
        "page-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "overlay-in": "overlay-in 150ms cubic-bezier(0.23,1,0.32,1)",
        "modal-in": "modal-in 200ms cubic-bezier(0.23,1,0.32,1)",
        "page-in": "page-in 200ms cubic-bezier(0.23,1,0.32,1)"
      }
    }
  },
  plugins: []
};
