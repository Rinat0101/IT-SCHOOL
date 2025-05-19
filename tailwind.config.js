/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./src/app/**/*.{js,ts,jsx,tsx,css}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Public Sans"', 'sans-serif'],
        },
        colors: {
          'blue-1': 'var(--blue-1)',
          'blue-2': 'var(--blue-2)',
          'blue-3': 'var(--blue-3)',
          'gray-1': 'var(--gray-1)',
          'gray-2': 'var(--gray-2)',
          'foreground': 'var(--foreground)',
          'background': 'var(--background)',
        }
      },
    },
    plugins: [],
  };