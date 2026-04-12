/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          'lavender': '#F8F6FC',
          'purple': '#8B5CF6',
          'purple-dark': '#6D28D9',
          'pink': '#D946EF',
          'text': '#312E81'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
