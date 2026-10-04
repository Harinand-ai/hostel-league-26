/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stadium: {
          980: '#040508',
          950: '#07090D', // Primary background
          900: '#10141A', // Secondary background
          850: '#151B24', // Surface
          800: '#1C2430', // Elevated
          750: '#232E3E',
          700: '#2D3A4F',
          600: '#3E4F6B',
          500: '#546A8C',
          400: '#7E90AA',
          300: '#9EA4AD', // Muted text
          200: '#CBD1DA',
          100: '#F4F4F0', // Warm white primary text
        },
        gold: {
          400: '#E5A93C', // Championship gold (used sparingly)
          500: '#D97706',
          600: '#B45309',
        },
        pitch: {
          400: '#34D399',
          500: '#10B981', // Deep pitch green
          600: '#059669',
        }
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'broadcast': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
        'broadcast-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'card': '8px',
        'badge': '4px',
      }
    },
  },
  plugins: [],
};
