
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["'Orbitron'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
