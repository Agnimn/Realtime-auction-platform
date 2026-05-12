/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f3d0fe',
          300: '#e9a8fc',
          400: '#d970f7',
          500: '#c040eb',
          600: '#a21ac9',
          700: '#8615a5',
          800: '#6f1487',
          900: '#5b146e',
        },
        accent: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea6c0c',
        },
        dark: {
          800: '#0f0f1a',
          850: '#13131f',
          900: '#0a0a14',
          card: '#1a1a2e',
          border: '#2a2a45',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'bid-flash': 'bid-flash 0.6s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(192,64,235,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(192,64,235,0.8), 0 0 40px rgba(192,64,235,0.4)' },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'bid-flash': {
          '0%': { backgroundColor: 'rgba(192,64,235,0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0a14 0%, #1a0a2e 50%, #0a0a14 100%)',
        'card-gradient': 'linear-gradient(145deg, #1a1a2e, #13131f)',
        'purple-glow': 'radial-gradient(ellipse at center, rgba(192,64,235,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
