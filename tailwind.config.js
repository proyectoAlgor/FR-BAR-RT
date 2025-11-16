/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema dorado/ámbar para THE GOLDEN GLASS
        golden: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Dorado principal
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006'
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Ámbar principal
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03'
        },
        // Colores complementarios para el bar
        whiskey: {
          50: '#fdf8f0',
          100: '#fbf0e1',
          200: '#f6e0c2',
          300: '#f0ca9d',
          400: '#e8b578',
          500: '#d4a574', // Whiskey/coñac
          600: '#b8935f',
          700: '#9c7a4a',
          800: '#7d623c',
          900: '#5d4a2e'
        }
      },
      fontFamily: {
        'golden': ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
