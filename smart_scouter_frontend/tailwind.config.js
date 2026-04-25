/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'ucluj-dark': '#0d1117',
        'ucluj-gray': '#161b22',
        'ucluj-green': '#00ff88',
      }
    },
  },
  plugins: [],
}