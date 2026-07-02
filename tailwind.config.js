/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'shine': 'shine 4s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)', filter: 'drop-shadow(0 5px 10px rgba(99, 102, 241, 0.4))' },
          '50%': { transform: 'translateY(-10px)', filter: 'drop-shadow(0 15px 20px rgba(99, 102, 241, 0.6))' },
        },
        shine: {
          to: { backgroundPosition: '200% center' },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
