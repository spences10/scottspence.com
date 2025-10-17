import { query } from '$app/server'
import {
	RESEND_API_KEY,
	RESEND_AUDIENCE_ID,
} from '$env/static/private'
import { sqlite_client } from '$lib/sqlite/client'
import { differenceInHours, parseISO } from 'date-fns'

async function get_resend_subscriber_count(): Promise<number> {
	try {
		const response = await fetch(
			`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts?limit=1`,
			{
				headers: {
					Authorization: `Bearer ${RESEND_API_KEY}`,
				},
			},
		)

		if (!response.ok) {
			throw new Error('Failed to fetch subscriber count from Resend')
		}

		const data = await response.json()
		// The API returns pagination metadata, count total contacts by fetching all pages
		let total_count = 0
		let has_more = true
		let after_cursor: string | undefined

		// First fetch (already done above, just set the count)
		if (data.data) {
			total_count = data.data.length
			has_more = data.has_more
			if (data.data.length > 0) {
				after_cursor = data.data[data.data.length - 1].id
			}
		}

		// Fetch remaining pages if needed
		while (has_more && after_cursor) {
			const next_response = await fetch(
				`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts?limit=100&after=${after_cursor}`,
				{
					headers: {
						Authorization: `Bearer ${RESEND_API_KEY}`,
					},
				},
			)

			if (!next_response.ok) break

			const next_data = await next_response.json()
			total_count += next_data.data?.length || 0
			has_more = next_data.has_more || false

			if (next_data.data && next_data.data.length > 0) {
				after_cursor = next_data.data[next_data.data.length - 1].id
			} else {
				break
			}
		}

		return total_count
	} catch (error) {
		console.error('Error fetching Resend subscriber count:', error)
		// Return 0 to indicate failure, will use fallback
		return 0
	}
}

async function get_cached_subscriber_count(): Promise<number> {
	try {
		const result = await sqlite_client.execute(
			'SELECT count FROM newsletter_subscriber ORDER BY last_updated DESC LIMIT 1;',
		)
		if (result.rows.length > 0) {
			return Number(result.rows[0].count) || 105
		}
		return 105
	} catch (error) {
		console.error('Error fetching cached subscriber count:', error)
		return 105
	}
}

export const get_subscriber_count = query(
	async (): Promise<SubscriberData> => {
		try {
			// Check the latest subscriber count from the database
			const latest = await sqlite_client.execute(
				'SELECT count, last_updated FROM newsletter_subscriber ORDER BY last_updated DESC LIMIT 1;',
			)

			// If we have a cached value less than 24 hours old, return it
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

			// Fetch from Resend API
			const resend_count = await get_resend_subscriber_count()

			// If we got a valid count from Resend, update the cache and return it
			if (resend_count > 0) {
				try {
					await sqlite_client.execute({
						sql: 'INSERT INTO newsletter_subscriber (count) VALUES (?);',
						args: [resend_count],
					})
				} catch (error) {
					console.error(
						'Error updating subscriber count cache:',
						error,
					)
				}
				return {
					newsletter_subscriber_count: resend_count,
				}
			}

			// Fall back to cached count if Resend fails
			const cached_count = await get_cached_subscriber_count()
			return {
				newsletter_subscriber_count: cached_count,
			}
		} catch (error) {
			console.error('Error in get_subscriber_count:', error)
			return {
				newsletter_subscriber_count: 105,
				error: 'Internal server error',
			}
		}
	},
)
