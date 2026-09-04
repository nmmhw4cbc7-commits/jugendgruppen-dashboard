import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F6",
        ink: "#1E1D1B",
        subtle: "#6B6862",
        line: "#E6E3DC",
        card: "#FFFFFF",
        accent: {
          DEFAULT: "#3F6B52",
          soft: "#E8EFE9",
          dark: "#2E4F3D",
        },
        warn: "#B4552F",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      borderRadius: {
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(30, 29, 27, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
