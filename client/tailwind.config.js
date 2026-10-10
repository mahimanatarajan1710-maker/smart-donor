/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f7f4',
          100: '#e1ede6',
          200: '#c5dccd',
          300: '#9cc2ab',
          400: '#6ea384',
          500: '#4b8564',
          600: '#386a4e',
          700: '#2e553f',
          800: '#274434',
          900: '#1b3325',
          950: '#0e1d15',
        },
        fresh: {
          500: '#10b981',
          600: '#059669',
        },
        amberAlert: '#f59e0b',
        criticalRed: '#ef4444'
      }
    },
  },
  plugins: [],
}
