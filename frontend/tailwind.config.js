/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e6f5ff', // çok açık mavi (pastel)
          100: '#cceaff',
          200: '#99d7ff',
          300: '#5cc2ff',
          400: '#189dff',
          500: '#0b7bd9', // kontrast için ana mavi
          600: '#075fae',
          700: '#064a84',
          800: '#053b6c',
          900: '#042c4d',
        },
      },
      boxShadow: {
        soft: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
}

