import { building } from '$app/environment'
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
	// Skip during prerendering/building
	if (building) {
		return await resolve(event)
	}

	const pathname = event.url.pathname.toLowerCase()

	// Get the real client IP address from headers
	const client_ip =
		event.request.headers.get('x-forwarded-for')?.split(',')[0] ||
		event.request.headers.get('x-real-ip') ||
		event.getClientAddress()

	if (rejected_extensions.some((ext) => pathname.endsWith(ext))) {
		console.log(
			`Suspicious file extension request dropped from IP ${client_ip}: ${pathname}`,
		)
		return new Response('', { status: 204 })
	}

	if (
		rejected_paths.some(
			(path) => pathname === path || pathname.startsWith(path + '/'),
		)
	) {
		console.log(
			`Suspicious path request dropped from IP ${client_ip}: ${pathname}`,
		)
		return new Response('', { status: 204 })
	}

	return await resolve(event)
}

const handle_redirects: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname

	// Handle old URL structure redirect
	const oldUrlMatch = pathname.match(
		/^\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)/,
	)
	if (oldUrlMatch) {
		const [, , , , slug] = oldUrlMatch
		return redirect(301, `/posts/${slug}`)
	}

	// Handle trailing slash
	if (pathname !== '/' && pathname.endsWith('/')) {
		return redirect(301, pathname.slice(0, -1))
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

// thanks Khromov https://www.youtube.com/watch?v=O_oXb3JSyrI
const handle_preload: Handle = async ({ event, resolve }) => {
	return await resolve(event, {
		preload: ({ type }) => {
			if (type === 'css' || type === 'font' || type === 'js') {
				return true
			}
			return false
		},
	})
}

export const handle = sequence(
	reject_suspicious_requests,
	handle_redirects,
	theme,
	handle_preload,
)
