import {
	EMAIL_APP_TO_ADDRESS,
	RESEND_API_KEY,
	RESEND_AUDIENCE_ID,
	RESEND_FROM_EMAIL,
} from '$env/static/private'
import { decrypt } from '$lib/crypto'
import { get_newsletters } from '$lib/newsletters'
import type { PageServerLoad } from './$types'

async function send_confirmation_notification(
	subscriber_email: string,
): Promise<void> {
	const now = new Date()
	const formatted_time = now.toLocaleString('en-GB', {
		dateStyle: 'full',
		timeStyle: 'short',
	})

	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: RESEND_FROM_EMAIL,
			to: EMAIL_APP_TO_ADDRESS,
			subject: `New newsletter subscription confirmed: ${subscriber_email}`,
			html: `
        <h2>New Newsletter Subscription Confirmed</h2>
        <p>A new subscriber has confirmed their newsletter subscription:</p>
        <p><strong>Email:</strong> ${subscriber_email}</p>
        <p><strong>Confirmed at:</strong> ${formatted_time}</p>
        <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
          Automated notification from scottspence.com
        </p>
      `,
		}),
	})

	if (!response.ok) {
		const error_data = await response.json()
		throw new Error(
			error_data.message || 'Failed to send notification email',
		)
	}
}

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token')
	const newsletters = await get_newsletters()

	if (!token) {
		return {
			status: 'error',
			message: 'Invalid confirmation link',
			newsletters,
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
				newsletters,
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
				newsletters,
			}
		}

		console.log(`Newsletter subscription confirmed for ${email}`)

		// Send notification to Scott (non-blocking)
		try {
			await send_confirmation_notification(email)
			console.log(
				`Notification email sent for subscription: ${email}`,
			)
		} catch (notification_error) {
			console.error(
				`Failed to send notification email for ${email}:`,
				notification_error instanceof Error
					? notification_error.message
					: 'Unknown error',
			)
		}

		return {
			status: 'success',
			message:
				'Your subscription has been confirmed! Welcome to the newsletter.',
			newsletters,
		}
	} catch (error_caught) {
		console.error(
			'Error verifying newsletter subscription:',
			error_caught,
		)
		return {
			status: 'error',
			message: 'Invalid or corrupted confirmation link',
			newsletters,
		}
	}
}
