const tailwind_theme = require('tailwindcss/defaultTheme')
const daisyui = require('daisyui')
const typography = require('@tailwindcss/typography')
const { create_daisy_themes } = require('./src/lib/themes')

const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    screens: {
      xs: '475px',
      ...tailwind_theme.screens,
    },
    extend: {
      fontFamily: {
        sans: ['Poppins', ...tailwind_theme.fontFamily.sans],
        serif: ['Manrope', ...tailwind_theme.fontFamily.serif],
        mono: ['Victor Mono', ...tailwind_theme.fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: null,
            img: {
              filter:
                'drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));',
              margin: '0 auto',
            },
          },
        },
      },
    },
  },

  daisyui: {
    darkTheme: 'night',
    themes: create_daisy_themes(),
    logs: false,
  },

  plugins: [typography, daisyui],
}

module.exports = config
