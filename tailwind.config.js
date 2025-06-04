/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
          'progressFill': 'progressFill 2s ease-out forwards',
        },
        keyframes: {
          fadeInUp: {
            '0%': {
              opacity: '0',
              transform: 'translateY(30px)'
            },
            '100%': {
              opacity: '1',
              transform: 'translateY(0)'
            }
          },
          progressFill: {
            '0%': {
              width: '0%'
            },
            '100%': {
              width: '75%'
            }
          }
        }
      },
    },
    plugins: [],
  }
