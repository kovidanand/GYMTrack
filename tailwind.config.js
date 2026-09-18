/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#1e1b4b',
          100: '#2e1065',
          200: '#3b0764',
          300: '#581c87',
          400: '#7c3aed',
          500: '#8b5cf6', // electric purple / indigo
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        surface: {
          50:  '#080A0F', // deepest gym background
          100: '#0D1017', // app background / page canvas
          150: '#11151D', // secondary container background
          200: '#1F2633', // subtle low-contrast borders & dividers
          250: '#242D3C', // card border & active borders
          300: '#2E3848', // elevated border / hover lines
          400: '#64748B', // muted labels / placeholders
          500: '#94A3B8', // secondary text
          600: '#CBD5E1', // readable body text
          700: '#E2E8F0', // high-contrast text
          800: '#F1F5F9', // bright titles
          900: '#FFFFFF', // pure white primary text
          950: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 4px 10px -2px rgba(0, 0, 0, 0.5)',
        glow: '0 0 24px rgba(139, 92, 246, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
