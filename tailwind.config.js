/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Exact fonts from bravenweb.com
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif:   ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // ── Braven exact tokens from braven-demo.html ──────────────────
        bg:      '#f0f1f0',   // --p  light bg
        bg2:     '#e8e9e7',   // --p2 secondary bg
        surface: '#ffffff',   // --w  white card surface
        navy:    '#12182a',   // --nv primary dark
        navy2:   '#1d2840',   // --nv2 hover navy
        coral:   '#ea6969',   // --cr accent (THE brand color)
        blue:    '#4d78bb',   // --bl secondary accent
        gray:    '#5e5d5d',   // --gy muted text
        rule:    'rgba(18,24,42,0.11)',

        // Dark mode overrides (applied via CSS vars)
        'dark-bg':      '#0e1117',
        'dark-bg2':     '#151b27',
        'dark-surface': '#1a2235',
        'dark-navy':    '#e8eaf0',
        'dark-navy2':   '#d0d4e0',
        'dark-gray':    '#9a9ba3',
        'dark-coral':   '#f08080',
        'dark-blue':    '#6a96d4',
      },
      borderRadius: {
        sm:   '5px',
        md:   '7px',
        lg:   '14px',
        xl:   '20px',
        '2xl':'28px',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':  'fade-up 0.28s ease-out',
        'fade-in':  'fade-in 0.2s ease-out',
        shimmer:    'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
