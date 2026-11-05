/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#070B14',
          sidebar: '#0A101D',
          card: '#0E1728',
          hover: '#16243C',
          border: '#1E2F4D',
          muted: '#64748B',
          text: '#F1F5F9',
        },
        // Named depth scale so surfaces stop being hardcoded hex literals.
        ink: {
          950: '#070B14',
          900: '#0A101D',
          850: '#0E1728',
          800: '#111D30',
          750: '#16243C',
          700: '#1E2F4D',
          650: '#27406A',
          600: '#2A436D',
        },
        brand: {
          blue: '#3B82F6',
          cyan: '#22D3EE',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
          purple: '#A855F7',
          indigo: '#6366F1',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.375rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,.4), 0 12px 32px -12px rgba(0,0,0,.55)',
        lifted: '0 2px 4px rgba(0,0,0,.45), 0 22px 48px -16px rgba(0,0,0,.7)',
        glow: '0 0 0 1px rgba(34,211,238,.18), 0 12px 40px -12px rgba(34,211,238,.32)',
        'glow-blue': '0 0 0 1px rgba(59,130,246,.2), 0 14px 44px -14px rgba(59,130,246,.4)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.05)',
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(120deg,#3B82F6 0%,#22D3EE 52%,#6366F1 100%)',
        'grad-text': 'linear-gradient(100deg,#93C5FD 0%,#67E8F9 45%,#A5B4FC 100%)',
        'grad-hairline': 'linear-gradient(90deg,transparent,rgba(34,211,238,.45),transparent)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(.94)' },
          '70%': { transform: 'scale(1.015)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-left': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'soft-float': {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'ring-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(34,211,238,.45)' },
          '100%': { boxShadow: '0 0 0 10px rgba(34,211,238,0)' },
        },
        'dash-draw': { to: { strokeDashoffset: '0' } },
      },
      animation: {
        'fade-up': 'fade-up .4s cubic-bezier(.22,.61,.36,1) both',
        'fade-in': 'fade-in .3s ease both',
        'pop-in': 'pop-in .28s cubic-bezier(.22,.61,.36,1) both',
        'slide-left': 'slide-left .3s ease both',
        shimmer: 'shimmer 2.2s linear infinite',
        'soft-float': 'soft-float 6s ease-in-out infinite',
        'ring-pulse': 'ring-pulse 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
}
