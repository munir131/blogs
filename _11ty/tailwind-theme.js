const plugin = require('tailwindcss/plugin')

module.exports = plugin(
  function ({ addBase }) {
    addBase({
      ':root': {
        '--primary': '#3B82F6',
        '--primary-dark': '#2563EB',
        '--background': '#FFFFFF',
        '--text': '#1F2937',
        '--muted': '#6B7280',
        '--accent': '#F472B6',
        '--code-bg': '#F3F4F6',
        '--code-text': '#1F2937',
      },
      '[data-theme="dark"]': {
        '--primary': '#60A5FA',
        '--primary-dark': '#3B82F6',
        '--background': '#1F2937',
        '--text': '#F3F4F6',
        '--muted': '#9CA3AF',
        '--accent': '#F472B6',
        '--code-bg': '#374151',
        '--code-text': '#F3F4F6',
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