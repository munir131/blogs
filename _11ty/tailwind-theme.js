const plugin = require('tailwindcss/plugin')

module.exports = plugin(
  function ({ addBase }) {
    addBase({
      ':root': {
        '--primary': '#2563eb',
        '--primary-dark': '#1d4ed8',
        '--background': '#ffffff',
        '--text': '#1a1a1a',
        '--muted': '#666666',
        '--accent': '#F472B6',
        '--code-bg': '#f3f4f6',
        '--code-text': '#1a1a1a',
        '--secondary-bg': '#f3f4f6',
        '--border-color': '#e5e7eb',
      },
      '[data-theme="dark"]': {
        '--primary': '#38bdf8',
        '--primary-dark': '#0ea5e9',
        '--background': '#0f172a',
        '--text': '#f8fafc',
        '--muted': '#94a3b8',
        '--accent': '#F472B6',
        '--code-bg': '#1e293b',
        '--code-text': '#f8fafc',
        '--secondary-bg': '#1e293b',
        '--border-color': '#334155',
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
          'secondary-bg': 'var(--secondary-bg)',
          'border-color': 'var(--border-color)',
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