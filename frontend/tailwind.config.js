/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '235px',
        'xl': '1100px',
        '2xl': '1300px',
      },
      colors: {
        'lotto-yellow': '#FFC107',
        'lotto-orange': '#FF9800',
        'lotto-gold': '#FFD700'
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite'
      }
    },
  },
  plugins: [],
} 