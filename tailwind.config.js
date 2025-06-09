/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f4f7',
          100: '#b3e0e8',
          500: '#004E64',
          600: '#003d52',
          700: '#002d3d',
          800: '#001e28',
          900: '#000f14'
        },
        secondary: {
          50: '#fff5f2',
          100: '#ffd4c4',
          500: '#FF7F50',
          600: '#ff6b3d',
          700: '#e55a36',
          800: '#cc4a2e',
          900: '#b33a26'
        },
        profit: {
          50: '#e6f7f1',
          100: '#b3e8d1',
          200: '#80d9b1',
          300: '#4dca91',
          400: '#26bb7d',
          500: '#00B894',
          600: '#00a085',
          700: '#008876',
          800: '#007066',
          900: '#005857'
        },
        loss: {
          50: '#fce8e8',
          100: '#f5b3b3',
          200: '#ee7e7e',
          300: '#e74949',
          400: '#e12828',
          500: '#D63031',
          600: '#c2282a',
          700: '#ae2022',
          800: '#9a181b',
          900: '#861013'
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      boxShadow: {
        'profit-200/50': '0 4px 6px -1px rgba(128, 217, 177, 0.5)',
        'loss-200/50': '0 4px 6px -1px rgba(238, 126, 126, 0.5)',
        'profit-800/30': '0 4px 6px -1px rgba(0, 112, 102, 0.3)',
        'loss-800/30': '0 4px 6px -1px rgba(154, 24, 27, 0.3)'
      }
    },
  },
  plugins: [],
};