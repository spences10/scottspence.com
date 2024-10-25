import { reactions } from '$lib/reactions-config'
import { ratelimit } from '$lib/redis'
import { turso_client } from '$lib/turso/client'
import { fail } from '@sveltejs/kit'

const allowed_reactions = reactions.map(r => r.type)

export const actions = {
	default: async ({ request, url, getClientAddress }) => {
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

		const data = await request.formData()
		const reaction = data.get('reaction')
		const path = url.searchParams.get('path')

		if (typeof reaction !== 'string' || typeof path !== 'string') {
			return fail(400, { error: 'Invalid reaction or path' })
		}

		// Validate reaction type
		if (!allowed_reactions.includes(reaction)) {
			return fail(400, { error: 'Invalid reaction type' })
		}

		// Validate path
		if (!/^\/posts\/[\w-]+$/.test(path)) {
			return fail(400, { error: 'Invalid path' })
		}

		const client = turso_client()

		await client.execute({
			sql: `INSERT INTO reactions (post_url, reaction_type, count) VALUES (?, ?, 1)
            ON CONFLICT (post_url, reaction_type)
            DO UPDATE SET count = count + 1, last_updated = CURRENT_TIMESTAMP;`,
			args: [path, reaction],
		})

		const result = await client.execute({
			sql: 'SELECT count FROM reactions WHERE post_url = ? AND reaction_type = ?',
			args: [path, reaction],
		})

		const count =
			result.rows.length > 0 ? Number(result.rows[0]['count']) : 0

		return {
			success: true,
			status: 200,
			reaction: reaction,
			path: path,
			count: count,
		}
	},
}
