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
          980: '#030508',
          950: '#06080d',
          900: '#0b0e14',
          850: '#10141e',
          800: '#151b28',
          750: '#1c2436',
          700: '#263147',
          600: '#384661',
          500: '#4e5f80',
          400: '#71809d',
          300: '#9aa7be',
          200: '#cbd4e2',
          100: '#eef2f7',
        },
        gold: {
          300: '#fde68a',
          400: '#fcd34d',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        pitch: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        display: ['Outfit', 'Cabinet Grotesk', 'Syne', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'broadcast': '0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'floodlight': '0 -30px 80px 10px rgba(16, 185, 129, 0.08), 0 20px 80px 10px rgba(56, 189, 248, 0.06)',
        'gold-glow': '0 0 25px rgba(245, 158, 11, 0.25)',
        'pitch-glow': '0 0 25px rgba(16, 185, 129, 0.2)',
      },
      letterSpacing: {
        'broadcast': '0.22em',
        'broadcast-wide': '0.35em',
      }
    },
  },
  plugins: [],
};
