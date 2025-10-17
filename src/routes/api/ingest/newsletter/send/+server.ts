import { INGEST_TOKEN } from '$env/static/private'
import { send_newsletter } from '$lib/newsletter/sender'
import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'

export const POST: RequestHandler = async (event) => {
	try {
		// Authenticate
		const auth_header = event.request.headers.get('Authorization')
		const token = auth_header?.replace('Bearer ', '')

		if (!token || token !== INGEST_TOKEN) {
			return json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Get filename from request body
		const body = await event.request.json()
		const { filename } = body

		if (!filename) {
			return json(
				{ error: 'filename parameter required' },
				{ status: 400 },
			)
		}

		// Send newsletter
		const result = await send_newsletter(filename)

		// Return result
		if (result.success) {
			return json(
				{
					success: true,
					message: result.message,
					broadcast_id: result.broadcast_id,
				},
				{ status: 200 },
			)
		} else {
			return json(
				{
					success: false,
					message: result.message,
				},
				{ status: 400 },
			)
		}
	} catch (error) {
		console.error('Newsletter send endpoint error:', error)
		return json(
			{
				error: 'Internal server error',
			},
			{ status: 500 },
		)
	}
}
