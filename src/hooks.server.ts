import { building } from '$app/environment'
import {
	rejected_extensions,
	rejected_paths,
} from '$lib/reject-patterns'
import { sqlite_client } from '$lib/sqlite/client'
import { themes } from '$lib/themes'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { createHash } from 'node:crypto'

const sync_on_startup: Handle = async ({ event, resolve }) => {
	// SQLite migration: No sync needed for local database
	return await resolve(event)
}

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
		return new Response(null, { status: 204 })
	}

	if (
		rejected_paths.some(
			(path) => pathname === path || pathname.startsWith(path + '/'),
		)
	) {
		console.log(
			`Suspicious path request dropped from IP ${client_ip}: ${pathname}`,
		)
		return new Response(null, { status: 204 })
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

const track_active_sessions: Handle = async ({ event, resolve }) => {
	// Skip during prerendering/building
	if (building) {
		return await resolve(event)
	}

	// Only track page visits, not API calls or static assets
	const pathname = event.url.pathname
	if (pathname.startsWith('/api/') || pathname.includes('.')) {
		return await resolve(event)
	}

	try {
		// Get client information for session tracking
		const client_ip =
			event.request.headers.get('x-forwarded-for')?.split(',')[0] ||
			event.request.headers.get('x-real-ip') ||
			event.getClientAddress()

		const user_agent = event.request.headers.get('user-agent') || ''

		// Generate proper session ID from IP + User Agent + timestamp
		const session_data = `${client_ip}-${user_agent}-${Date.now()}`
		const session_id = createHash('sha256')
			.update(session_data)
			.digest('hex')
			.substring(0, 16) // Use first 16 chars for shorter ID

		// Update current visitors table
		const current_visitors_stmt = sqlite_client.prepare(`
			INSERT OR REPLACE INTO current_visitors (session_id, page_slug, last_visit)
			VALUES (?, ?, CURRENT_TIMESTAMP)
		`)
		current_visitors_stmt.run(session_id, pathname)

		// Update user session table
		const user_session_stmt = sqlite_client.prepare(`
			INSERT OR IGNORE INTO user_session (ip_address, session_start, user_agent, referrer)
			VALUES (?, CURRENT_TIMESTAMP, ?, ?)
		`)
		const referrer = event.request.headers.get('referer') || null
		user_session_stmt.run(client_ip, user_agent, referrer)
	} catch (error) {
		console.warn('Session tracking failed:', error)
		// Continue with request even if tracking fails
	}

	return await resolve(event)
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
	sync_on_startup,
	reject_suspicious_requests,
	handle_redirects,
	track_active_sessions,
	theme,
	handle_preload,
)
