/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': "#1B1B1F",
        'secondary': "#161618",
      },
      borderColor: {
        "DEFAULT": "#52525b"
      }
    }
  }
}
