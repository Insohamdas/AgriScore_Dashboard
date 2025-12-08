/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#348520',
          secondary: '#2a7b20',
          dark: '#064812',
          accent: '#105717',
          light: '#1e6c1c',
        },
      },
    },
  },
  plugins: [],
}
