import { building } from '$app/environment'
import { track_page_view } from '$lib/analytics/track.server'
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

// Initialize database on startup - skip during build
if (!building) {
	// Run migrations first - they add columns to existing tables
	// For fresh db, this creates the migrations table and handles missing tables gracefully
	run_migrations()

	// Then apply full schema - creates tables if missing, creates indexes
	// For existing db, CREATE TABLE IF NOT EXISTS skips, but indexes are created
	const schema = readFileSync('src/lib/sqlite/schema.sql', 'utf-8')
	sqlite_client.exec(schema)

	// Checkpoint WAL on startup to prevent bloat
	// TRUNCATE mode: checkpoint and truncate WAL file to zero bytes
	try {
		sqlite_client.exec('PRAGMA wal_checkpoint(TRUNCATE);')
		console.log('WAL checkpoint completed on startup')
	} catch (error) {
		console.warn('WAL checkpoint failed:', error)
	}
}

// Request timing instrumentation - diagnose slow responses
const time_request: Handle = async ({ event, resolve }) => {
	const start = performance.now()
	const response = await resolve(event)
	const total = performance.now() - start
	// Only log slow requests (>500ms) or __data.json requests
	if (total > 500 || event.url.pathname.includes('__data')) {
		console.log(
			`[timing] ${event.url.pathname} ${total.toFixed(0)}ms`,
		)
	}
	return response
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

const track_analytics: Handle = async ({ event, resolve }) => {
	// Skip during build
	if (building) {
		return await resolve(event)
	}

	const pathname = event.url.pathname

	// Skip internal paths, API routes, assets, and remote function calls
	if (
		pathname.startsWith('/_') ||
		pathname.startsWith('/__') ||
		pathname.startsWith('/api/') ||
		pathname.includes('.') ||
		pathname.includes('__remote')
	) {
		return await resolve(event)
	}

	// Resolve the page FIRST, then track analytics
	// This prevents blocking page rendering with sync DB writes
	const response = await resolve(event)

	// Track GET requests to page routes AFTER response is ready
	// Fire-and-forget: don't block the response being sent
	if (event.request.method === 'GET') {
		try {
			track_page_view(event.request, pathname)
		} catch (error) {
			console.error('Analytics tracking failed:', error)
		}
	}

	return response
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
	time_request,
	sync_on_startup,
	reject_suspicious_requests,
	handle_redirects,
	// track_analytics, // disabled - DB writes overwhelming under load
	theme,
	handle_preload,
)
