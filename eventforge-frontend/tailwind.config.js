/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F4FC',
        surface: '#FFFFFF',
        ink: '#17153A',
        'ink-soft': '#5B5779',
        'ink-faint': '#8B87A8',
        line: '#E4E1F2',
        violet: {
          50: '#F1EEFE', 100: '#E4DEFD', 200: '#C9BEFB', 300: '#A78CF7',
          400: '#8867F3', 500: '#6C4CF1', 600: '#5636D6', 700: '#4527AD',
          800: '#341E82', 900: '#241659',
        },
        amber: {
          50: '#FFF2EA', 100: '#FFE0CE', 300: '#FFAD7C', 400: '#FF8F55',
          500: '#FF7A3D', 600: '#F0592F', 700: '#C4441F',
        },
        mint: {
          50: '#E8FBF6', 100: '#C7F5E9', 400: '#2FD9AE', 500: '#17C3A2', 600: '#0FA087',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(23,21,58,0.06), 0 8px 24px rgba(23,21,58,0.06)',
        lift: '0 8px 20px rgba(23,21,58,0.10), 0 20px 48px rgba(108,76,241,0.14)',
        glow: '0 0 0 1px rgba(108,76,241,0.15), 0 8px 32px rgba(108,76,241,0.28)',
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tilt, 0deg))' },
          '50%': { transform: 'translateY(-10px) rotate(var(--tilt, 0deg))' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(108,76,241,0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(108,76,241,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        dash: { to: { strokeDashoffset: 0 } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};
