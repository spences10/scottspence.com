import { command, getRequestEvent } from '$app/server'
import {
	RESEND_API_KEY,
	RESEND_AUDIENCE_ID,
	RESEND_FROM_EMAIL,
} from '$env/static/private'
import { encrypt } from '$lib/crypto'
import { ratelimit } from '$lib/redis'
import * as v from 'valibot'

const newsletter_schema = v.object({
	email: v.pipe(
		v.string(),
		v.trim(),
		v.email('Invalid email format'),
	),
})

export const subscribe_to_newsletter = command(
	newsletter_schema,
	async (data) => {
		const { request } = getRequestEvent()
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0] ||
			request.headers.get('x-real-ip') ||
			'unknown'

		// Check rate limit
		const rate_limit_attempt = await ratelimit.limit(ip)
		if (!rate_limit_attempt.success) {
			const time_remaining = Math.floor(
				(rate_limit_attempt.reset - new Date().getTime()) / 1000,
			)
			throw new Error(
				`Rate limit exceeded. Try again in ${time_remaining} seconds`,
			)
		}

		try {
			// Add contact to audience as unsubscribed (pending confirmation)
			const add_contact_response = await fetch(
				`https://api.resend.com/audiences/${RESEND_AUDIENCE_ID}/contacts`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${RESEND_API_KEY}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: data.email,
						unsubscribed: true,
					}),
				},
			)

			if (!add_contact_response.ok) {
				const error_data = await add_contact_response.json()

				// Check for duplicate email error
				if (
					add_contact_response.status === 422 &&
					error_data.message?.includes('already exists')
				) {
					throw new Error('Email already subscribed')
				}

				throw new Error(error_data.message || 'Failed to add contact')
			}

			// Generate encrypted token with email and timestamp
			const token_data = `${data.email}:${Date.now()}`
			const token = encrypt(token_data)

			// Create confirmation link
			const { url } = getRequestEvent()
			const base_url = `${url.protocol}//${url.host}`
			const confirmation_link = `${base_url}/newsletter/verify?token=${encodeURIComponent(token)}`

			// Send confirmation email
			const email_response = await fetch(
				'https://api.resend.com/emails',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${RESEND_API_KEY}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						from: `Scott <${RESEND_FROM_EMAIL}>`,
						to: data.email,
						subject: 'Confirm your newsletter subscription',
						html: `
							<h1>Confirm Your Subscription</h1>
							<p>Thanks for signing up! Please click the link below to confirm your subscription:</p>
							<p><a href="${confirmation_link}">Confirm Subscription</a></p>
							<p>This link will expire in 24 hours.</p>
							<p>If you didn't request this, you can safely ignore this email.</p>
						`,
					}),
				},
			)

			if (!email_response.ok) {
				const error_data = await email_response.json()
				throw new Error(
					error_data.message || 'Failed to send confirmation email',
				)
			}

			console.log(
				`Newsletter confirmation email sent to ${data.email} (IP: ${ip})`,
			)

			return {
				success: true,
				message:
					'Please check your email to confirm your subscription',
			}
		} catch (error: unknown) {
			const error_message =
				error instanceof Error ? error.message : 'Unknown error'
			console.error(
				`Error in newsletter subscription: ${error_message}`,
			)

			// Re-throw the error so it's properly handled by the remote function
			throw new Error(error_message)
		}
	},
)
