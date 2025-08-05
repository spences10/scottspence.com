import { BUTTONDOWN_API_KEY } from '$env/static/private'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import { differenceInHours, parseISO } from 'date-fns'

const CACHE_KEY = 'subscribers'

const buttondown_url = 'https://api.buttondown.email'
const buttondown_endpoint = '/v1/subscribers'

class SubscribersState {
	data = $state<SubscriberData>({ newsletter_subscriber_count: 0 })
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	async load_subscriber_count(): Promise<void> {
		if (BYPASS_DB_READS.subscribers) {
			this.data = { newsletter_subscriber_count: 105 }
			return // DB reads disabled
		}

		// Check server cache first
		const server_cached = get_from_cache<SubscriberData>(
			CACHE_KEY,
			CACHE_DURATIONS.subscribers,
		)
		if (server_cached) {
			this.data = server_cached
			this.last_fetched = Date.now()
			return
		}

		// Check client cache
		if (
			Date.now() - this.last_fetched < CACHE_DURATIONS.subscribers &&
			(this.data.newsletter_subscriber_count ?? 0) > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = sqlite_client

		try {
			// Check the latest subscriber count from the database
			let latest = await client.execute(
				'SELECT count, last_updated FROM newsletter_subscriber ORDER BY last_updated DESC LIMIT 1;',
			)

			if (latest.rows.length > 0) {
				const last_updated = parseISO(
					String(latest.rows[0].last_updated),
				)
				if (differenceInHours(new Date(), last_updated) < 24) {
					this.data = {
						newsletter_subscriber_count: Number(latest.rows[0].count),
					}
					this.last_fetched = Date.now()
					return
				}
			}

			// Call Buttondown API
			const response = await fetch(
				buttondown_url + buttondown_endpoint,
				{
					headers: { Authorization: `Token ${BUTTONDOWN_API_KEY}` },
				},
			)
			if (!response.ok) {
				throw new Error('Error fetching newsletter subscriber count')
			}
			const api_response = await response.json()
			const newsletter_subscriber_count = api_response.count

			// Insert new data if different from the latest in the database
			if (
				latest.rows.length === 0 ||
				newsletter_subscriber_count !== Number(latest.rows[0].count)
			) {
				await client.execute({
					sql: 'INSERT INTO newsletter_subscriber (count) VALUES (?);',
					args: [newsletter_subscriber_count],
				})
			}

			// Re-query the database to get the latest count
			const updatedResult = await client.execute(
				'SELECT count FROM newsletter_subscriber ORDER BY last_updated DESC LIMIT 1;',
			)

			const subscriber_data = {
				newsletter_subscriber_count: Number(
					updatedResult.rows[0].count,
				),
			}

			// Update both caches
			this.data = subscriber_data
			this.last_fetched = Date.now()
			set_cache(CACHE_KEY, subscriber_data)
		} catch (error) {
			console.warn(
				'Database unavailable, keeping cached subscriber count:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}
}

// Single universal instance shared everywhere
export const subscribers_state = new SubscribersState()

// Fallback function for server-side usage and backward compatibility
export const get_subscriber_count =
	async (): Promise<SubscriberData> => {
		const client = sqlite_client

		try {
			// Check the latest subscriber count from the database
			let latest = await client.execute(
				'SELECT count, last_updated FROM newsletter_subscriber ORDER BY last_updated DESC LIMIT 1;',
			)

			if (latest.rows.length > 0) {
				const last_updated = parseISO(
					String(latest.rows[0].last_updated),
				)
				if (differenceInHours(new Date(), last_updated) < 24) {
					return {
						newsletter_subscriber_count: Number(latest.rows[0].count),
					}
				}
			}

			// Call Buttondown API
			const response = await fetch(
				buttondown_url + buttondown_endpoint,
				{
					headers: { Authorization: `Token ${BUTTONDOWN_API_KEY}` },
				},
			)
			if (!response.ok) {
				throw new Error('Error fetching newsletter subscriber count')
			}
			const api_response = await response.json()
			const newsletter_subscriber_count = api_response.count

			// Insert new data if different from the latest in the database
			if (
				latest.rows.length === 0 ||
				newsletter_subscriber_count !== Number(latest.rows[0].count)
			) {
				await client.execute({
					sql: 'INSERT INTO newsletter_subscriber (count) VALUES (?);',
					args: [newsletter_subscriber_count],
				})
			}

			// Re-query the database to get the latest count
			const updatedResult = await client.execute(
				'SELECT count FROM newsletter_subscriber ORDER BY last_updated DESC LIMIT 1;',
			)

			return {
				newsletter_subscriber_count: Number(
					updatedResult.rows[0].count,
				),
			}
		} catch (error) {
			console.warn(
				'Database unavailable, returning 0 subscriber count:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return {
				newsletter_subscriber_count: 105,
				error: 'Internal server error',
			}
		}
	}
