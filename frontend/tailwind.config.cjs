/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/styles/global.css",
  ], // FIXED: Include CSS for @apply scanning
  theme: {
    extend: {},
  },
  plugins: [],
};
