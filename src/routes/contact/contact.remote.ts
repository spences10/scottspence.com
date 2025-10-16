import { command, getRequestEvent } from '$app/server'
import {
	EMAIL_APP_TO_ADDRESS,
	RESEND_API_KEY,
	RESEND_FROM_EMAIL,
	TURNSTILE_SECRET_KEY,
} from '$env/static/private'
import { ratelimit } from '$lib/redis'
import * as v from 'valibot'

const contact_schema = v.object({
	name: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Name is required'),
		v.maxLength(100, 'Name must be less than 100 characters'),
	),
	email: v.pipe(
		v.string(),
		v.trim(),
		v.email('Invalid email format'),
	),
	reason: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Reason is required'),
		v.maxLength(100, 'Reason must be less than 100 characters'),
	),
	message: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Message is required'),
		v.maxLength(1000, 'Message must be less than 1000 characters'),
	),
	subject: v.optional(v.string()),
	turnstile_token: v.string(),
})

async function verify_turnstile(
	token: string,
	ip: string,
): Promise<boolean> {
	const response = await fetch(
		'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				secret: TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: ip,
			}),
		},
	)

	const data = await response.json()
	return data.success === true
}

async function send_email(
	name: string,
	email: string,
	reason: string,
	message: string,
	recipient: string,
): Promise<string> {
	console.log('[send_email] Sending email to:', recipient)
	const response = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: RESEND_FROM_EMAIL,
			to: recipient,
			reply_to: email,
			subject: `Contact form: ${reason}`,
			html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
		}),
	})

	console.log('[send_email] Response status:', response.status)
	if (!response.ok) {
		const error_data = await response.json()
		console.error('[send_email] Error response:', error_data)
		throw new Error(error_data.message || 'Failed to send email')
	}

	const data = await response.json()
	console.log('[send_email] Email sent successfully, ID:', data.id)
	return data.id
}

export const submit_contact = command(
	contact_schema,
	async (data) => {
		console.log(
			'[submit_contact] Form submission received with data:',
			data,
		)
		const { request } = getRequestEvent()
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0] ||
			request.headers.get('x-real-ip') ||
			'unknown'
		console.log('[submit_contact] Client IP:', ip)

		// Verify Turnstile token
		const is_valid = await verify_turnstile(data.turnstile_token, ip)
		if (!is_valid) {
			throw new Error('Failed to verify captcha. Please try again.')
		}

		// Check rate limit
		const rate_limit_attempt = await ratelimit.limit(ip)
		console.log(
			'[submit_contact] Rate limit check:',
			rate_limit_attempt.success,
		)
		if (!rate_limit_attempt.success) {
			const time_remaining = Math.floor(
				(rate_limit_attempt.reset - new Date().getTime()) / 1000,
			)
			throw new Error(
				`Rate limit exceeded. Try again in ${time_remaining} seconds`,
			)
		}

		// Honeypot check
		if (data.subject) {
			console.log(`Potential spam detected from IP: ${ip}`)
			return {
				success: true,
				message: 'Email sent successfully',
			}
		}

		try {
			const message_id = await send_email(
				data.name,
				data.email,
				data.reason,
				data.message,
				EMAIL_APP_TO_ADDRESS,
			)

			console.log(
				`Email sent successfully from ${data.email} (IP: ${ip})`,
			)

			return {
				success: true,
				message: 'Email sent successfully',
				messageId: message_id,
			}
		} catch (error: unknown) {
			console.error(
				`Error in contact form submission: ${error instanceof Error ? error.message : 'Unknown error'}`,
			)
			throw new Error('Failed to send email. Please try again later.')
		}
	},
)
