/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EE',
          100: '#F3E9D2',
          500: '#D4AF37', // Official Gold
          600: '#B89728',
          700: '#94751A',
        },
        dark: {
          DEFAULT: '#121212',
          card: '#1E1E1E',
        }
      },
    },
  },
  plugins: [],
}