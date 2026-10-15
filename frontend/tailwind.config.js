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
        veyra: {
          950: '#070A11',
          900: '#0B0F19',
          850: '#111726',
          800: '#172033',
          750: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50:  '#F8FAFC',
        },
        risk: {
          safe: '#10B981',
          'safe-bg': 'rgba(16, 185, 129, 0.08)',
          'safe-border': 'rgba(16, 185, 129, 0.25)',
          medium: '#F59E0B',
          'medium-bg': 'rgba(245, 158, 11, 0.08)',
          'medium-border': 'rgba(245, 158, 11, 0.25)',
          high: '#F97316',
          'high-bg': 'rgba(249, 115, 22, 0.08)',
          'high-border': 'rgba(249, 115, 22, 0.25)',
          critical: '#EF4444',
          'critical-bg': 'rgba(239, 68, 68, 0.08)',
          'critical-border': 'rgba(239, 68, 68, 0.25)',
        },
        accent: {
          blue: '#3B82F6',
          'blue-bg': 'rgba(59, 130, 246, 0.08)',
          'blue-border': 'rgba(59, 130, 246, 0.25)',
          lime: '#bef264',
          'lime-glow': 'rgba(190, 242, 100, 0.25)',
        },
        lime: {
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          accent: '#bbf246',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['Syne', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs': ['11px', '16px'],
        'sm': ['12px', '18px'],
        'base': ['13px', '20px'],
        'md': ['14px', '22px'],
        'lg': ['16px', '24px'],
        'xl': ['18px', '26px'],
        '2xl': ['22px', '28px'],
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
      }
    },
  },
  plugins: [],
}
