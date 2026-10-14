/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0d0d0d",
          card: "#171717",
          border: "#2a2a2a",
        },
        brand: {
          DEFAULT: "#f5940c",
          light: "#ffb24d",
          dark: "#c26f00",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
