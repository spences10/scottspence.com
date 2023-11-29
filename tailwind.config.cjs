const tailwind_theme = require('tailwindcss/defaultTheme')
const daisyui = require('daisyui')
const typography = require('@tailwindcss/typography')
const { themes } = require('./src/lib/themes')

function create_theme(theme_name, font_family) {
  return {
    [theme_name]: {
      ...require('daisyui/src/theming/themes')[theme_name],
      ...(font_family ? { fontFamily: font_family } : {}),
    },
  }
}

const custom_font = {
  corporate: 'Manrope Variable',
  cyberpunk: 'Victor Mono Variable',
}

const daisy_themes = themes.map(theme =>
  create_theme(theme, custom_font[theme]),
)

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
    themes: daisy_themes,
    logs: false,
  },

  plugins: [typography, daisyui],
}

module.exports = config
