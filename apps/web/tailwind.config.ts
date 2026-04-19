import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // "Invisible Security" palette — calm blues + greens for trust signals.
        brand: {
          50: '#eff8ff',
          100: '#d9efff',
          200: '#bce3ff',
          300: '#8ed1ff',
          400: '#59b6ff',
          500: '#3396ff',
          600: '#1f76f5',
          700: '#1a60e1',
          800: '#1c4eb6',
          900: '#1d448f',
          950: '#162a56',
        },
        vault: {
          500: '#10b981', // encrypted badge green
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
