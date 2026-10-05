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
          980: '#030509',
          950: '#06090F', // Ultra deep cyber black background
          900: '#0C111C', // Secondary dark surface
          850: '#121A2A', // Elevated card surface
          800: '#182337', // Elevated border
          750: '#212E47',
          700: '#2C3D5D',
          600: '#3D537D',
          500: '#526E9F',
          400: '#7995C2',
          300: '#9DB3D6', // Crisp secondary text
          200: '#CAD7EC',
          100: '#F4F7FC', // Crisp white primary text
        },
        gold: {
          300: '#FFF066',
          400: '#FFE600', // Electric neon gold
          500: '#FFC700',
          600: '#E6A800',
        },
        pitch: {
          300: '#5CFFAC',
          400: '#00FF85', // Electric cyber neon green
          500: '#00E575',
          600: '#00B359',
          950: '#021F12',
        },
        neon: {
          green: '#00FF85',
          cyan: '#00F0FF',
          gold: '#FFE600',
          pink: '#FF007F',
          purple: '#A855F7',
        }
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'Outfit', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'broadcast': '0 8px 32px -4px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'broadcast-sm': '0 4px 16px -2px rgba(0, 0, 0, 0.7)',
        'neon-green': '0 0 25px -4px rgba(0, 255, 133, 0.5)',
        'neon-cyan': '0 0 25px -4px rgba(0, 240, 255, 0.5)',
        'neon-gold': '0 0 25px -4px rgba(255, 230, 0, 0.45)',
        'neon-glow': '0 0 15px 0 rgba(0, 255, 133, 0.3)',
      },
      borderRadius: {
        'card': '12px',
        'badge': '6px',
      }
    },
  },
  plugins: [],
};
