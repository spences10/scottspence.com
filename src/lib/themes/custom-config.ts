import { themes } from "./themes"

export const custom_themes: Record<string, Record<string, string>> = {
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

export const custom_font = {
  corporate: 'Manrope Variable',
  cyberpunk: 'Victor Mono Variable',
}

export function create_daisy_themes() {
  return themes.map(theme => {
    if (theme === 'wireframe') {
      return {
        [theme]: {
          ...require('daisyui/src/theming/themes')[theme],
          ...custom_themes.wireframe,
        },
      }
    }
    return {
      [theme]: {
        ...require('daisyui/src/theming/themes')[theme],
        ...(custom_font[theme as keyof typeof custom_font]
          ? {
              fontFamily:
                custom_font[theme as keyof typeof custom_font],
            }
          : {}),
      },
    }
  })
}
