import { BUTTONDOWN_API_KEY } from '$env/static/private'
import { turso_client } from '$lib/turso/client.js'
import { differenceInHours, parseISO } from 'date-fns'
import { getContext, setContext } from 'svelte'

const buttondown_url = 'https://api.buttondown.email'
const buttondown_endpoint = '/v1/subscribers'

interface SubscriberData {
	newsletter_subscriber_count?: number
	error?: string
}

class SubscribersState {
	data = $state<SubscriberData>({ newsletter_subscriber_count: 0 })
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
	private readonly BYPASS_DB_READS = true // Set to false to enable DB reads

	async load_subscriber_count(): Promise<void> {
		if (this.BYPASS_DB_READS) {
			this.data = { newsletter_subscriber_count: 105 }
			return // DB reads disabled
		}

		// Check if cache is still valid
		if (
			Date.now() - this.last_fetched < this.CACHE_DURATION &&
			(this.data.newsletter_subscriber_count ?? 0) > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = turso_client()

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
			const data = await response.json()
			const newsletter_subscriber_count = data.count

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

			this.data = {
				newsletter_subscriber_count: Number(
					updatedResult.rows[0].count,
				),
			}
			this.last_fetched = Date.now()
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

const SUBSCRIBERS_KEY = Symbol('subscribers')

export function set_subscribers_state() {
	const state = new SubscribersState()
	setContext(SUBSCRIBERS_KEY, state)
	return state
}

export function get_subscribers_state(): SubscribersState {
	return getContext<SubscribersState>(SUBSCRIBERS_KEY)
}

// Fallback function for server-side usage and backward compatibility
export const get_subscriber_count =
	async (): Promise<SubscriberData> => {
		const client = turso_client()

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
			const data = await response.json()
			const newsletter_subscriber_count = data.count

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
