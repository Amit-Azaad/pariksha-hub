import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      colors: {
        // Custom color variables
        'header': 'var(--color-header)',
        'bottom-nav': 'var(--color-bottom-nav)',
        'card': 'var(--color-card)',
        'button': 'var(--color-button)',
        'button-hover': 'var(--color-button-hover)',
        'text': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'border': 'var(--color-border)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
      }
    },
  },
  plugins: [],
} satisfies Config;
