/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        customBlue: '#06BBCC',
      },
      outline: {
        red: '1px solid #f87171',
      }
    },
  },
  plugins: [],
}
