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

// const block_fathom: Handle = async ({ event, resolve }) => {
//   const response = await resolve(event)
//   const block_fathom_value = event.cookies.get('block_fathom')
//   const new_headers = new Headers(response.headers)
//   if (block_fathom_value) {
//     new_headers.append(
//       'Set-Cookie',
//       `block_fathom=${block_fathom_value}; Path=/; SameSite=Strict`,
//     )
//   }
//   return {
//     ...response,
//     headers: new_headers,
//   }
// }

export const handle = sequence(theme /*, block_fathom*/)
