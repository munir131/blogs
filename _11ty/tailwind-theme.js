const plugin = require('tailwindcss/plugin')

module.exports = plugin(
  function ({ addBase }) {
    addBase({
      ':root': {
        '--primary': '#0d9488',
        '--primary-dark': '#0b7c72',
        '--background': '#ffffff',
        '--text': '#333333',
        '--muted': '#6B7280',
        '--accent': '#F472B6',
        '--code-bg': '#F3F4F6',
        '--code-text': '#1F2937',
      },
      '[data-theme="dark"]': {
        '--primary': '#2dd4bf',
        '--primary-dark': '#0d9488',
        '--background': '#0e1117',
        '--text': '#f0f0f0',
        '--muted': '#9CA3AF',
        '--accent': '#F472B6',
        '--code-bg': '#1a1a1a',
        '--code-text': '#f0f0f0',
      },
    })
  },
  {
    theme: {
      extend: {
        colors: {
          primary: 'var(--primary)',
          'primary-dark': 'var(--primary-dark)',
          background: 'var(--background)',
          text: 'var(--text)',
          muted: 'var(--muted)',
          accent: 'var(--accent)',
          'code-bg': 'var(--code-bg)',
          'code-text': 'var(--code-text)',
        },
        fontFamily: {
          sans: ['"Inter"', 'sans-serif'],
        },
        maxWidth: {
          prose: '65ch',
        },
      },
    },
  }
)