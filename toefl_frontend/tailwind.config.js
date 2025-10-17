// toefl_frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 确保有这一行
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}