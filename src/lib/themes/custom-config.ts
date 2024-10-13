import { themes } from './themes'

export const custom_themes: Record<
	string,
	Partial<Record<string, string>>
> = {
	wireframe: {
		primary: '#000080', // Navy Blue
		secondary: '#008080', // Teal
		accent: '#ff00ff', // Magenta
		neutral: '#c0c0c0', // Silver
		'base-100': '#c0c0c0', // Silver (background)
		info: '#00ffff', // Cyan
		success: '#00ff00', // Lime
		warning: '#ffff00', // Yellow
		error: '#ff0000', // Red
		'--rounded-box': '0', // Sharp corners
		'--rounded-btn': '0',
		'--rounded-badge': '0',
		'--tab-radius': '0',
	},
	// You can add more custom themes here
}

export const custom_font: Record<string, string> = {
	corporate: 'Manrope Variable',
	cyberpunk: 'Victor Mono Variable',
	wireframe:
		"'Chalkboard', 'comic sans ms', 'sans-serif', 'Playpen Sans Variable'",
}

export function create_daisy_themes() {
	const daisy_themes = require('daisyui/src/theming/themes')

	return themes.map(theme => {
		const base_theme = daisy_themes[theme] || {}
		const custom_theme = custom_themes[theme] || {}
		const font_family = custom_font[theme]

		return {
			[theme]: {
				...base_theme,
				...custom_theme,
				...(font_family ? { fontFamily: font_family } : {}),
			},
		}
	})
}
