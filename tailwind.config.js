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
          950: '#070a12',
          900: '#0b1120',
          850: '#0f172a',
          800: '#141e34',
          750: '#1a2642',
          700: '#223254',
          600: '#334870',
          400: '#64748b',
          200: '#cbd5e1',
          100: '#f1f5f9',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        pitch: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        display: ['Outfit', 'Cabinet Grotesk', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(56, 189, 248, 0.15)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.25)',
        'pitch-glow': '0 0 20px rgba(16, 185, 129, 0.2)',
      }
    },
  },
  plugins: [],
};
