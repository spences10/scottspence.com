import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { fetch_fathom_data } from '$lib/fathom'
import { turso_client } from '$lib/turso/client'
import { getContext, setContext } from 'svelte'

interface AnalyticsParams {
	pathname: string
	date_grouping?: string
	date_from?: string
	date_to?: string
	sort_by?: string
}

interface AnalyticsData {
	analytics: any[]
	message?: string
}

class AnalyticsState {
	cache = $state<
		Map<string, { data: AnalyticsData; timestamp: number }>
	>(new Map())
	loading = $state<Set<string>>(new Set())

	private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
	private readonly BYPASS_DB_READS = true // Set to false to enable DB reads

	async load_analytics(
		params: AnalyticsParams,
	): Promise<AnalyticsData> {
		if (this.BYPASS_DB_READS) {
			return { analytics: [], message: 'Analytics DB reads disabled' }
		}

		const cache_key = JSON.stringify(params)

		// Check cache first
		const cached = this.cache.get(cache_key)
		if (
			cached &&
			Date.now() - cached.timestamp < this.CACHE_DURATION
		) {
			return cached.data
		}

		// Prevent concurrent requests
		if (this.loading.has(cache_key)) {
			return cached?.data || { analytics: [] }
		}

		this.loading.add(cache_key)

		try {
			const {
				pathname,
				date_grouping = 'day',
				date_from,
				date_to,
				sort_by,
			} = params

			// Extract slug from pathname, assuming it always starts with '/posts/'
			const slug = pathname.replace('/posts/', '')

			// Check if the slug exists in the posts table
			const client = turso_client()
			const exists = await client.execute({
				sql: 'SELECT 1 FROM posts WHERE slug = ?',
				args: [slug],
			})

			if (exists.rows.length === 0) {
				const result = {
					analytics: [],
					message: 'Post not in posts table.',
				}
				this.cache.set(cache_key, {
					data: result,
					timestamp: Date.now(),
				})
				return result
			}

			const date_params = this.build_date_params(
				date_from,
				date_to,
				date_grouping,
				sort_by,
			)
			const default_params = this.build_default_params(pathname)
			const fathom_params = { ...default_params, ...date_params }

			const analytics_data = await fetch_fathom_data(
				fetch,
				`aggregations`,
				fathom_params,
				`analytics_GET`,
			)

			let result: AnalyticsData
			if (
				Array.isArray(analytics_data) &&
				analytics_data.length > 0
			) {
				result = { analytics: analytics_data }
			} else {
				console.error(
					`analytics returned data in unexpected format. ${JSON.stringify(
						fathom_params,
						null,
						2,
					)}`,
				)
				result = {
					analytics: [],
					message:
						'No analytics data available for the given parameters.',
				}
			}

			// Cache the result
			this.cache.set(cache_key, {
				data: result,
				timestamp: Date.now(),
			})
			return result
		} catch (error) {
			console.warn(
				'Analytics unavailable, returning cached or empty data:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return cached?.data || { analytics: [] }
		} finally {
			this.loading.delete(cache_key)
		}
	}

	private build_date_params(
		date_from: string | undefined,
		date_to: string | undefined,
		date_grouping: string | undefined,
		sort_by: string | undefined,
	) {
		return {
			...(date_from && { date_from }),
			...(date_to && { date_to }),
			...(date_grouping && { date_grouping }),
			...(sort_by && { sort_by }),
		}
	}

	private build_default_params(pathname: string) {
		return {
			entity: 'pageview',
			entity_id: PUBLIC_FATHOM_ID,
			aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
			field_grouping: 'pathname',
			filters: `[{"property": "pathname","operator": "is","value": "${pathname}"}]`,
		}
	}
}

const ANALYTICS_KEY = Symbol('analytics')

export function set_analytics_state() {
	const state = new AnalyticsState()
	setContext(ANALYTICS_KEY, state)
	return state
}

export function get_analytics_state(): AnalyticsState {
	return getContext<AnalyticsState>(ANALYTICS_KEY)
}

// Fallback function for server-side usage and backward compatibility
export const get_analytics = async (
	params: AnalyticsParams,
): Promise<AnalyticsData> => {
	const BYPASS_DB_READS = true // Set to false to enable DB reads
	if (BYPASS_DB_READS) {
		return { analytics: [], message: 'Analytics DB reads disabled' }
	}

	try {
		const {
			pathname,
			date_grouping = 'day',
			date_from,
			date_to,
			sort_by,
		} = params

		// Extract slug from pathname, assuming it always starts with '/posts/'
		const slug = pathname.replace('/posts/', '')

		// Check if the slug exists in the posts table
		const client = turso_client()
		const exists = await client.execute({
			sql: 'SELECT 1 FROM posts WHERE slug = ?',
			args: [slug],
		})

		if (exists.rows.length === 0) {
			return {
				analytics: [],
				message: 'Post not in posts table.',
			}
		}

		const date_params = build_date_params(
			date_from,
			date_to,
			date_grouping,
			sort_by,
		)
		const default_params = build_default_params(pathname)
		const fathom_params = { ...default_params, ...date_params }

		const analytics_data = await fetch_fathom_data(
			fetch,
			`aggregations`,
			fathom_params,
			`analytics_GET`,
		)

		if (Array.isArray(analytics_data) && analytics_data.length > 0) {
			return { analytics: analytics_data }
		} else {
			console.error(
				`analytics returned data in unexpected format. ${JSON.stringify(
					fathom_params,
					null,
					2,
				)}`,
			)
			return {
				analytics: [],
				message:
					'No analytics data available for the given parameters.',
			}
		}
	} catch (error) {
		console.warn(
			'Analytics unavailable, returning empty data:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return { analytics: [] }
	}
}

// Helper functions for server-side usage
const build_date_params = (
	date_from: string | undefined,
	date_to: string | undefined,
	date_grouping: string | undefined,
	sort_by: string | undefined,
) => ({
	...(date_from && { date_from }),
	...(date_to && { date_to }),
	...(date_grouping && { date_grouping }),
	...(sort_by && { sort_by }),
})

const build_default_params = (pathname: string) => ({
	entity: 'pageview',
	entity_id: PUBLIC_FATHOM_ID,
	aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
	field_grouping: 'pathname',
	filters: `[{"property": "pathname","operator": "is","value": "${pathname}"}]`,
})

// Export types
export type { AnalyticsData, AnalyticsParams }
