const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/views/**/*.{erb,haml,html,slim}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', ...defaultTheme.fontFamily.sans],
        mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
        code: ['Source Code Pro', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        // Slate blue base colors
        slate: {
          850: '#1E293B', // background-primary
          750: '#334155', // background-secondary
          650: '#475569', // background-tertiary
        },
        // Primary Accent - Vibrant Teal
        teal: {
          DEFAULT: '#2DD4BF',
          hover: '#5EEAD4',
          muted: '#2DD4BF20',
        },
        // Secondary Accent - Coral
        coral: {
          DEFAULT: '#F472B6',
          hover: '#F9A8D4',
        },
        // Text colors
        text: {
          primary: '#F8FAFC',
          secondary: '#CBD5E1',
          tertiary: '#94A3B8',
        },
        // Semantic colors
        success: '#34D399',
        wins: '#2DD4BF',
        'ai-insights': '#F472B6',
      },
      boxShadow: {
        'teal-glow': '0 0 15px rgba(45, 212, 191, 0.3)',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/container-queries'),
  ]
}
