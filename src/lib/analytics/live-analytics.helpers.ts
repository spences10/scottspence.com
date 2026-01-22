import type { RequestEvent } from '@sveltejs/kit'
import { parse_user_agent } from './utils'

export type SessionMetadata = {
	country?: string
	browser?: string
	device_type?: string
}

/**
 * Extract session metadata from request headers
 * Testable helper - doesn't depend on SvelteKit internals
 */
export const extract_session_metadata = (
	user_agent: string | null,
	country_header: string | null,
): SessionMetadata => {
	const { browser, device_type } = parse_user_agent(user_agent)

	return {
		country: country_header || undefined,
		browser: browser || undefined,
		device_type: device_type || undefined,
	}
}

/**
 * Extract metadata from a request event
 * Convenience wrapper for use in remote functions
 */
export const extract_metadata_from_event = (
	event: RequestEvent | undefined,
): SessionMetadata => {
	if (!event) {
		return {}
	}

	const user_agent = event.request.headers.get('user-agent')
	const country = event.request.headers.get('cf-ipcountry')

	return extract_session_metadata(user_agent, country)
}

export type LiveStatsBreakdown = {
	active_visitors: number
	recent_visitors: number
	active_pages: { path: string; viewers: number }[]
	countries: { country: string; visitors: number }[]
	countries_total: number
	browsers: { browser: string; visitors: number }[]
	devices: { device_type: string; visitors: number }[]
	top_paths: { path: string; views: number; visitors: number }[]
	paths_total: number
}

/**
 * Transform session breakdown into stats page format
 * Pure function - easily testable
 */
export const format_live_stats_breakdown = (breakdown: {
	active_visitors: number
	countries: { country: string; visitors: number }[]
	countries_total: number
	browsers: { browser: string; visitors: number }[]
	devices: { device_type: string; visitors: number }[]
	top_paths: { path: string; views: number; visitors: number }[]
	paths_total: number
}): LiveStatsBreakdown => {
	const active_pages = breakdown.top_paths.map(
		({ path, visitors }) => ({
			path,
			viewers: visitors,
		}),
	)

	return {
		active_visitors: breakdown.active_visitors,
		recent_visitors: breakdown.active_visitors,
		active_pages,
		countries: breakdown.countries,
		countries_total: breakdown.countries_total,
		browsers: breakdown.browsers,
		devices: breakdown.devices,
		top_paths: breakdown.top_paths,
		paths_total: breakdown.paths_total,
	}
}
