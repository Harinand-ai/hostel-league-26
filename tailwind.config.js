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
        football: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a', // Primary football green
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        pitch: {
          400: '#16a34a',
          500: '#15803d',
          600: '#166534',
          950: '#052e16',
        },
        gold: {
          400: '#d97706',
          500: '#b45309',
        },
        stadium: {
          980: '#0f172a',
          950: '#0f172a',
          900: '#1e293b',
          850: '#334155',
          800: '#e2e8f0',
          750: '#cbd5e1',
          700: '#94a3b8',
          600: '#64748b',
          500: '#475569',
          400: '#334155',
          300: '#1e293b',
          200: '#0f172a',
          100: '#020617',
        },
      },
      fontFamily: {
        display: ['Inter', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
        'badge': '6px',
      }
    },
  },
  plugins: [],
};
