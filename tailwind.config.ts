// tailwind.config.js
export default {
  content: ['./components/**/*.{vue,js}', './layouts/**/*.vue', './pages/**/*.vue', './app.vue', './locales/**/*.json'],
  safelist: [
    'pl-3',
    '-indent-3',
    {
      pattern: /grid-cols-(\d+)/
    }
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto-sans-jp': ['"Noto Sans JP"', 'sans-serif']
      },
      screens: {
        short_md: { raw: '(max-height: 630px)' },
        short_xl: { raw: '(max-height: 875px)' }
      },
      colors: {
        // Màu chữ
        primary: '#414647',
        secondary: '#A2A9A9',
        table: '#717A7A',

        // Màu viền
        border: '#e7e9e9',

        // Màu nền
        active: '#EEF2FA',
        chart: '#60A5FA'
      },
      fontSize: {
        base: ['0.9375rem', { lineHeight: '1.4rem' }] // 14px
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
