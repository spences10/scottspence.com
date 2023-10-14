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

const block_fathom: Handle = async ({ event, resolve }) => {
  const block_fathom = event.cookies.get('block_fathom')
  const response = await resolve(event)

  event.locals.block_fathom = event.cookies.get('block_fathom')

  response.headers.append(
    'Set-Cookie',
    `block_fathom=${block_fathom}; Path=/; SameSite=Strict`,
  )

  return response
}

export const handle = sequence(theme, block_fathom)
