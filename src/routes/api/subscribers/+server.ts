import { BUTTONDOWN_API_KEY } from '$env/static/private'
import { turso_client } from '$lib/turso/client.js'
import { json } from '@sveltejs/kit'
import { differenceInHours, parseISO } from 'date-fns'

const buttondown_url = 'https://api.buttondown.email'
const buttondown_endpoint = '/v1/subscribers'

export const GET = async () => {
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
				return json({
					newsletter_subscriber_count: Number(latest.rows[0].count),
				})
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

		return json({
			newsletter_subscriber_count: updatedResult.rows[0].count,
		})
	} catch (error) {
		console.error('Error:', error)
		return {
			status: 500,
			body: 'Internal server error',
		}
	}
}
