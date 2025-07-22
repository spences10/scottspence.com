import { building } from '$app/environment'
import { ratelimit, redis } from '$lib/redis/client'
import {
	rejected_extensions,
	rejected_paths,
} from '$lib/reject-patterns'
import { themes } from '$lib/themes'
import { error, redirect, type Handle } from '@sveltejs/kit'
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

	// Log bot activity for analysis
	const user_agent =
		event.request.headers.get('user-agent') || 'unknown'
	const is_bot = /bot|crawl|spider|scrape|fetch/i.test(user_agent)

	if (is_bot) {
		console.log(
			`BOT REQUEST: ${client_ip} | ${user_agent} | ${pathname}`,
		)
	}

	// Rate limit all requests per IP (skip static assets)
	if (
		!pathname.startsWith('/static/') &&
		!pathname.startsWith('/favicon')
	) {
		// Check if IP is blocked for an hour
		const block_key = `blocked:${client_ip}`
		const is_blocked = await redis.get(block_key)

		if (is_blocked) {
			const ttl = await redis.ttl(block_key)
			const minutes_remaining = Math.ceil(ttl / 60)
			console.log(
				`BLOCKED IP: ${client_ip} | ${user_agent} | ${pathname} | ${minutes_remaining}min remaining`,
			)
			throw error(
				429,
				`IP blocked for excessive requests. Try again in ${minutes_remaining} minutes`,
			)
		}

		const rate_limit_result = await ratelimit.limit(
			`global:${client_ip}`,
		)

		if (!rate_limit_result.success) {
			// Block IP for 1 hour when rate limit exceeded
			await redis.setex(block_key, 3600, 'blocked')

			console.log(
				`IP BLOCKED FOR 1 HOUR: ${client_ip} | ${user_agent} | ${pathname}`,
			)
			throw error(
				429,
				`Rate limit exceeded. IP blocked for 1 hour due to excessive requests`,
			)
		}
	}

	if (rejected_extensions.some((ext) => pathname.endsWith(ext))) {
		console.log(
			`Suspicious file extension request redirected from IP ${client_ip}: ${pathname}`,
		)
		throw redirect(302, 'https://www.google.com')
	}

	if (
		rejected_paths.some(
			(path) => pathname === path || pathname.startsWith(path + '/'),
		)
	) {
		console.log(
			`Suspicious path request redirected from IP ${client_ip}: ${pathname}`,
		)
		throw redirect(302, 'https://www.google.com')
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
