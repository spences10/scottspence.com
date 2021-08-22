const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
  mode: 'jit',
  purge: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    screens: {
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

module.exports = config
