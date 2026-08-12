/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f7f6',
          100: '#e3ebe8',
          200: '#c5d6d0',
          300: '#9bb8ae',
          400: '#6f9487',
          500: '#54786c',
          600: '#426057',
          700: '#374e47',
          800: '#2f403b',
          900: '#283632',
          950: '#141d1b',
        },
        accent: {
          DEFAULT: '#c45c26',
          soft: '#e8a078',
          dark: '#9a4318',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 18px 40px -24px rgba(20, 29, 27, 0.45)',
      },
    },
  },
  plugins: [],
};
