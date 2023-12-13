import { themes } from '$lib/themes'
import {
  create_or_update_session,
  current_visitors,
} from '$lib/turso'
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

const user_session: Handle = async ({ event, resolve }) => {
  try {
    const session_cookie = event.cookies.get('session-data')
    const user_agent = event.request.headers.get('user-agent')
    const referrer = event.request.headers.get('referer')
    const request_ip = event.getClientAddress()
    event.locals.user_ip = request_ip

    let session_id

    if (session_cookie) {
      // We got a session cookie, so we can extract the session_id
      const session_data = JSON.parse(session_cookie)
      session_id = session_data.session_id
    }

    if (!session_id) {
      session_id = await create_or_update_session(
        request_ip,
        user_agent,
        referrer,
      )
    }

    // await handle_geolocation_data(request_ip, session_id)
    const page_slug = event.url.pathname
    if (
      !page_slug.match(/\.[^/]+$/) &&
      page_slug !== '/session-end'
    ) {
      // Ignore static files
      await current_visitors(session_id, page_slug)
    }

    // Set session cookie
    const session_data = {
      session_id: session_id.toString(), // Convert BigInt to string
      user_agent,
      referrer,
    }
    console.log('=====================')
    console.log('session_data: ', session_data)
    console.log('=====================')
    event.cookies.set('session-data', JSON.stringify(session_data), {
      path: '/',
      httpOnly: false, // Set to false to access it via JavaScript
    })
  } catch (error) {
    console.error('Error in user_session handle: ', error)
  }
  return resolve(event)
}

export const handle = sequence(theme, user_session)
