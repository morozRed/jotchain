const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}',
    './app/components/**/*.{erb,haml,html,slim,rb}',
    './config/initializers/heroicon.rb'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      colors: {
        accent: {
          DEFAULT: '#FFA116', // Electric Amber - keeping this as requested
          hover: '#FFB84D',
          muted: 'rgba(255, 161, 22, 0.1)',
          light: 'rgba(255, 161, 22, 0.2)',
        },
        text: {
          primary: '#111827', // Dark text for light theme
          secondary: '#6B7280', // Secondary text
          tertiary: '#71717A', // Tertiary text (WCAG AA compliant)
        },
        background: {
          DEFAULT: '#F9FAFB', // Light background
          secondary: '#F3F4F6', // Secondary background
          tertiary: '#E5E7EB', // Tertiary background
          card: '#FFFFFF', // White card background
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        wins: {
          minor: '#60A5FA',
          major: '#FFA116',
          career: '#F97316',
        },
        border: '#E5E7EB', // Light border
        skill: {
          communication: '#FFA116',
          typescript: '#3B82F6',
          design: '#8B5CF6',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in forwards',
        'fade-out': 'fadeOut 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/container-queries'),
  ]
}