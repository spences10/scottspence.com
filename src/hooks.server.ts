import { themes } from '$lib/themes'
import { error, json, text, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'

const csrf_config = {
  allowed_paths: ['/api/reactions', '/api/submit-email', '/contact'],
}

type ErrorResponse = {
  status: number
  body: {
    message: string
  }
}

const csrf =
  (allowed_paths: string[]): Handle =>
  async ({ event, resolve }) => {
    const forbidden =
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
        event.request.method,
      ) &&
      event.request.headers.get('origin') !== event.url.origin &&
      is_form_content_type(event.request) &&
      !allowed_paths.includes(event.url.pathname)

    if (forbidden) {
      const csrf_error: ErrorResponse = error(
        403,
        `Cross-site ${event.request.method} form submissions are forbidden`,
      )
      if (
        event.request.headers.get('accept') === 'application/json'
      ) {
        return json(csrf_error.body, { status: csrf_error.status })
      }
      return text(csrf_error.body.message, {
        status: csrf_error.status,
      })
    }

    return resolve(event)
  }

const is_content_type = (request: Request, ...types: string[]) => {
  const type =
    request.headers.get('content-type')?.split(';', 1)[0].trim() ?? ''
  return types.includes(type)
}

const is_form_content_type = (request: Request) => {
  return is_content_type(
    request,
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  )
}

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

export const handle = sequence(csrf(csrf_config.allowed_paths), theme)
