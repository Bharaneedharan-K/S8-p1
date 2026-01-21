/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-900': '#0f3460',
        'green-800': '#16a34a',
        'green-100': '#dcfce7',
      },
      backdrop: {
        blur: {
          md: '12px',
          sm: '4px',
          '3xl': '64px',
        }
      }
    },
  },
  plugins: [],
}
