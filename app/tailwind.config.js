/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#F6F5FB', deep: '#1B1437' },
        primary: { DEFAULT: '#6C5CE7', soft: '#EFECFD' },
        mint: { DEFAULT: '#3ECFAD', soft: '#E5F9F3' },
        pink: { DEFAULT: '#F47FB0', soft: '#FDEAF3' },
        ink: { DEFAULT: '#2D2A3E', sub: '#8A87A0' },
        card: '#FFFFFF',
      },
      borderRadius: { card: '18px' },
      boxShadow: {
        card: '0 6px 24px rgba(45,42,62,0.055), 0 1px 3px rgba(108,92,231,0.04)',
        'card-hover': '0 14px 36px rgba(45,42,62,0.09), 0 3px 10px rgba(108,92,231,0.06)',
        nav: '0 -6px 24px rgba(45,42,62,0.07)',
        button: '0 6px 16px rgba(108,92,231,0.20)',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
