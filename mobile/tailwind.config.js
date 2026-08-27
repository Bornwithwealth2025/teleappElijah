/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#071633",
          blue: "#0F6BFF",
          blueDeep: "#0757D7",
          violet: "#6426FF",
          purple: "#8B22FF",
          green: "#22D386",
          coral: "#FF4B3E",
          gold: "#FFB21C",
        },
        surface: {
          page: "#FFFFFF",
          base: "#FAFBFD",
          strong: "#F2F4F8",
          hover: "#ECEFF4",
          dark: "#0A1428",
          darkCard: "#0F1D3A",
          darkStrong: "#142542",
        },
        ink: {
          strong: "#071633",
          muted: "#5B6B85",
          soft: "#8996AC",
          inverse: "#F5F8FF",
          darkMuted: "#A7B4CC",
        },
        line: {
          DEFAULT: "#E5E9F0",
          strong: "#D5DCE7",
          dark: "#223154",
          darkStrong: "#2D3F66",
        },
        state: {
          success: "#22D386",
          warning: "#FFB21C",
          danger: "#FF4B3E",
        },
      },
      borderRadius: {
        ui: "16px",
        card: "24px",
        sheet: "28px",
      },
      boxShadow: {
        soft: "0 6px 16px rgba(16, 33, 63, 0.06)",
        card: "0 10px 24px rgba(16, 33, 63, 0.08)",
        enterprise: "0 18px 34px rgba(16, 33, 63, 0.12)",
        floating: "0 10px 24px rgba(15, 107, 255, 0.2)",
      },
      spacing: {
        18: "72px",
        22: "88px",
      },
    },
  },
  plugins: [],
};