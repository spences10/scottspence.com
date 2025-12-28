import { building } from '$app/environment'
import {
	queue_page_view,
	start_flush_timer,
} from '$lib/analytics/queue'
import {
	anonymise_ip,
	get_client_ip,
	get_visitor_hash,
	parse_user_agent,
	should_skip_path,
} from '$lib/analytics/utils'
import {
	rejected_extensions,
	rejected_paths,
} from '$lib/reject-patterns'
import { sqlite_client } from '$lib/sqlite/client'
import { run_migrations } from '$lib/sqlite/migrate'
import { themes } from '$lib/themes'
import { redirect, type Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { readFileSync } from 'node:fs'

// Initialize schema on startup - skip during build
if (!building) {
	const schema = readFileSync('src/lib/sqlite/schema.sql', 'utf-8')
	sqlite_client.exec(schema)

	// Run any pending migrations
	run_migrations()

	// Checkpoint WAL on startup to prevent bloat
	try {
		sqlite_client.exec('PRAGMA wal_checkpoint(TRUNCATE);')
		console.log('[startup] WAL checkpoint completed')
	} catch (error) {
		console.warn('[startup] WAL checkpoint failed:', error)
	}

	// Start analytics flush timer (5s interval)
	start_flush_timer()
}

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

const track_analytics: Handle = async ({ event, resolve }) => {
	// Skip during build
	if (building) {
		return await resolve(event)
	}

	const pathname = event.url.pathname

	// Skip paths that shouldn't be tracked
	if (should_skip_path(pathname)) {
		return await resolve(event)
	}

	// Resolve the page FIRST, then queue analytics
	// This ensures tracking never blocks page rendering
	const response = await resolve(event)

	// Track GET requests to page routes AFTER response is ready
	if (event.request.method === 'GET') {
		try {
			const ip = get_client_ip(event.request)
			const user_agent = event.request.headers.get('user-agent')
			const referrer = event.request.headers.get('referer')
			const country = event.request.headers.get('cf-ipcountry')
			const visitor_hash = get_visitor_hash(ip, user_agent)
			const { browser, os, device_type, is_bot } =
				parse_user_agent(user_agent)

			// Queue event - does NOT block, just array push
			queue_page_view({
				visitor_hash,
				event_type: 'page_view',
				event_name: null,
				path: pathname,
				referrer,
				user_agent,
				ip: anonymise_ip(ip),
				country,
				browser,
				os,
				device_type,
				is_bot,
				props: null,
				created_at: Date.now(),
			})
		} catch (error) {
			// Analytics should never break the site
			console.error('[analytics] Queue failed:', error)
		}
	}

	return response
}

export const handle = sequence(
	sync_on_startup,
	reject_suspicious_requests,
	track_analytics,
	handle_redirects,
	theme,
	handle_preload,
)
