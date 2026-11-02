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
        card: '0 4px 16px rgba(108,92,231,0.08)',
        nav: '0 -2px 12px rgba(45,42,62,0.06)',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
