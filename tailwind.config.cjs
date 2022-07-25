const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: null,
            img: {
              filter:
                'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

module.exports = config
