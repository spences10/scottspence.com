const tailwind_theme = require('tailwindcss/defaultTheme')
const daisyui = require('daisyui')
const typography = require('@tailwindcss/typography')

function create_theme(theme_name, font_family) {
  return {
    [theme_name]: {
      ...require('daisyui/src/theming/themes')[
        `[data-theme=${theme_name}]`
      ],
      ...(font_family ? { fontFamily: font_family } : {}),
    },
  }
}

const daisy_themes = [
  create_theme('acid'),
  create_theme('aqua'),
  create_theme('autumn'),
  create_theme('black'),
  create_theme('bumblebee'),
  create_theme('business'),
  create_theme('cmyk'),
  create_theme('coffee'),
  create_theme('corporate', 'Manrope'),
  create_theme('cupcake'),
  create_theme('cyberpunk', 'Victor Mono'),
  create_theme('dark'),
  create_theme('dracula'),
  create_theme('emerald'),
  create_theme('fantasy'),
  create_theme('forest'),
  create_theme('garden'),
  create_theme('halloween'),
  create_theme('lemonade'),
  create_theme('light'),
  create_theme('lofi'),
  create_theme('luxury'),
  create_theme('night'),
  create_theme('pastel'),
  create_theme('retro'),
  create_theme('synthwave'),
  create_theme('valentine'),
  create_theme('winter'),
  create_theme('wireframe'),
]

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
