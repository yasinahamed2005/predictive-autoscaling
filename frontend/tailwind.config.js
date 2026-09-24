/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1523',
          soft: '#241D33',
          border: '#332B47',
        },
        paper: {
          DEFAULT: '#FBF9F6',
          soft: '#F3EFE8',
        },
        brand: {
          50: '#EEF0FD',
          100: '#DCE0FB',
          200: '#B3BBF5',
          300: '#8B96EF',
          400: '#5C64E0',
          500: '#4338CA',
          600: '#372CAE',
          700: '#2B2288',
          800: '#211A69',
          900: '#181350',
        },
        marigold: {
          50: '#FFF7E8',
          100: '#FFEBC2',
          300: '#FCC864',
          500: '#F5A623',
          600: '#D98A0F',
          700: '#B06D08',
        },
        saffron: {
          500: '#E8590C',
          600: '#C24707',
        },
        leaf: {
          500: '#16A34A',
          600: '#158A3F',
        },
        rose: {
          500: '#E11D48',
          600: '#BE123C',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,21,35,0.06), 0 4px 12px rgba(26,21,35,0.06)',
        'card-hover': '0 8px 24px rgba(26,21,35,0.14)',
        pop: '0 12px 32px rgba(67,56,202,0.25)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        marquee: 'marquee 22s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
