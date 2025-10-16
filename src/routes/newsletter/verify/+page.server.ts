import {
	RESEND_API_KEY,
	RESEND_AUDIENCE_ID,
} from '$env/static/private'
import { decrypt } from '$lib/crypto'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token')

	if (!token) {
		return {
			status: 'error',
			message: 'Invalid confirmation link',
		}
	}

	try {
		// Decrypt token to get email and timestamp
		const decrypted_token = decrypt(token)
		const [email, timestamp] = decrypted_token.split(':')

		// Check if token is expired (24 hours)
		const token_age = Date.now() - Number.parseInt(timestamp)
		const twenty_four_hours = 24 * 60 * 60 * 1000

		if (token_age > twenty_four_hours) {
			return {
				status: 'error',
				message: 'This confirmation link has expired',
			}
		}

		// Update contact in Resend audience to subscribed
		const response = await fetch(
			`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts/${email}`,
			{
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${RESEND_API_KEY}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					unsubscribed: false,
				}),
			},
		)

		if (!response.ok) {
			const error_data = await response.json()
			console.error('Failed to update contact:', error_data)
			return {
				status: 'error',
				message: 'Failed to confirm subscription. Please try again.',
			}
		}

		console.log(`Newsletter subscription confirmed for ${email}`)

		return {
			status: 'success',
			message:
				'Your subscription has been confirmed! Welcome to the newsletter.',
		}
	} catch (error_caught) {
		console.error(
			'Error verifying newsletter subscription:',
			error_caught,
		)
		return {
			status: 'error',
			message: 'Invalid or corrupted confirmation link',
		}
	}
}
