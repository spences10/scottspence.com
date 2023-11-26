import { themes } from '$lib/themes'
import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const theme: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get('theme')

  if (!theme || !themes.includes(theme)) {
    return await resolve(event)
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`)
    },
  })
}

export const handle = sequence(theme)
