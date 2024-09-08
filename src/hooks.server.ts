import {
  rejected_extensions,
  rejected_paths,
} from '$lib/reject-patterns'
import { themes } from '$lib/themes'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const reject_suspicious_requests: Handle = async ({
  event,
  resolve,
}) => {
  const pathname = event.url.pathname.toLowerCase()

  if (rejected_extensions.some(ext => pathname.endsWith(ext))) {
    console.log(
      `Suspicious file extension request redirected: ${pathname}`,
    )
    throw redirect(302, 'https://www.google.com')
  }

  if (
    rejected_paths.some(
      path => pathname === path || pathname.startsWith(path + '/'),
    )
  ) {
    console.log(`Suspicious path request redirected: ${pathname}`)
    throw redirect(302, 'https://www.google.com')
  }

  return await resolve(event)
}

export const theme: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get('theme')

  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      if (theme && themes.includes(theme)) {
        return html.replace('data-theme=""', `data-theme="${theme}"`)
      }
      return html
    },
  })
}

export const handle = sequence(reject_suspicious_requests, theme)
