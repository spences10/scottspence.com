import { BUTTONDOWN_API_KEY } from '$env/static/private'
import { ratelimit } from '$lib/redis'
import { fail } from '@sveltejs/kit'

const buttondown_url = 'https://api.buttondown.email'
const buttondown_endpoint = '/v1/subscribers'

export const actions = {
	default: async ({ request, getClientAddress }) => {
		const ip = getClientAddress()
		const rate_limit_attempt = await ratelimit.limit(ip)

		if (!rate_limit_attempt.success) {
			const time_remaining = Math.floor(
				(rate_limit_attempt.reset - new Date().getTime()) / 1000,
			)

			return fail(429, {
				error: `Rate limit exceeded. Try again in ${time_remaining} seconds`,
				time_remaining,
			})
		}

		try {
			const data = await request.formData()
			const email = data.get('email')
			const tags = ['scottspence.com']

			const response = await fetch(
				buttondown_url + buttondown_endpoint,
				{
					method: 'POST',
					headers: {
						Authorization: `Token ${BUTTONDOWN_API_KEY}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email, tags }),
				},
			)

			if (response.status === 201) {
				const body = await response.json()
				return {
					status: 200,
					body,
				}
			} else {
				const error_body = await response.json()
				return fail(response.status, {
					body: error_body,
					error:
						error_body.detail ||
						'An error occurred with Buttondown API.',
				})
			}
		} catch (error) {
			return fail(500, {
				error: 'Internal server error',
			})
		}
	},
}
