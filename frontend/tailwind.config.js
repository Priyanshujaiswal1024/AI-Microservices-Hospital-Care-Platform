/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F5F5B', // Clinical Teal
          hover: '#12302E',
          light: '#EBF0EC',
        },
        success: {
          DEFAULT: '#1F5F5B',
          light: '#EBF0EC',
        },
        warning: {
          DEFAULT: '#C8862B', // Gold/Amber
          light: '#F6E8CC',
        },
        danger: {
          DEFAULT: '#f43f5e',
          light: '#fff1f2',
        },
        slate: {
          50: '#F5F7F5', // Bone
          100: '#EBF0EC', // BoneAlt
          200: '#DCE4DF', // Hline
          300: '#CBD5E1',
          400: '#8A9A94', // InkFaint
          500: '#71717a',
          600: '#4B5D57', // InkSoft
          700: '#3f3f46',
          800: '#12302E', // TealDark
          900: '#12241F', // Ink
          950: '#12241F', // Deep Ink
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
