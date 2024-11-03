import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'
import tailwind_theme from 'tailwindcss/defaultTheme'
import { create_daisy_themes } from './src/lib/themes'

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		screens: {
			xs: '475px',
			...tailwind_theme.screens,
		},
		extend: {
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
} satisfies Config
