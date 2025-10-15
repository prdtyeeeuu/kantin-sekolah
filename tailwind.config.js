const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./views/**/*.ejs"],
  theme: {
    extend: {
      colors: {
        indigo: colors.indigo,
      },
      backgroundImage: {
        'kantin-bg': "url('/images/bg.jpg')",
      }
    },
  },
  plugins: [],
}