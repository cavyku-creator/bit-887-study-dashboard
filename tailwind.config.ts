import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        muted: "#5f6368",
        line: "#dcd7ce",
        paper: "#f7f5f0",
        panel: "#ffffff",
        accent: "#256f68",
        math: "#2f6db5",
        english: "#6b6aa8",
        politics: "#9b4f45",
        professional: "#3c7b4f"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(32, 33, 36, 0.07)"
      }
    }
  },
  plugins: [forms]
};

export default config;
