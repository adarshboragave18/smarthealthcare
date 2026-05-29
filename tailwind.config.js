/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      colors: {
        healthcare: {
          teal:  '#14b8a6',
          cyan:  '#06b6d4',
          green: '#22c55e',
          blue:  '#3b82f6',
        }
      },
      animation: {
        'fade-in':     'fade-in 0.5s ease both',
        'slide-up':    'slide-up 0.35s ease both',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite alternate',
        'pulse-ring':  'pulse-ring 2s infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'float': {
          '0%':   { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-20px)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(20,184,166,.4)' },
          '70%':  { boxShadow: '0 0 0 12px rgba(20,184,166,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(20,184,166,0)' },
        },
      },
      backdropBlur: { xl: '20px' },
    },
  },
  plugins: [],
}
