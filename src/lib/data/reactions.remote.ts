import { command, query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { reactions } from '$lib/reactions-config'
import { ratelimit } from '$lib/redis'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

const allowed_reactions = reactions.map((r) => r.type)

interface ReactionResult {
	success: boolean
	status: number
	reaction?: string
	path?: string
	count?: number
	error?: string
	time_remaining?: number
}

export const submit_reaction = command(
	v.object({
		reaction: v.string(),
		path: v.string(),
		ip: v.string(),
	}),
	async ({
		reaction,
		path,
		ip,
	}: {
		reaction: string
		path: string
		ip: string
	}): Promise<ReactionResult> => {
		try {
			// Rate limiting
			const rate_limit_attempt = await ratelimit.limit(ip)

			if (!rate_limit_attempt.success) {
				const time_remaining = Math.floor(
					(rate_limit_attempt.reset - new Date().getTime()) / 1000,
				)

				return {
					success: false,
					status: 429,
					error: `Rate limit exceeded. Try again in ${time_remaining} seconds`,
					time_remaining,
				}
			}

			// Validate reaction type
			if (!allowed_reactions.includes(reaction)) {
				return {
					success: false,
					status: 400,
					error: 'Invalid reaction type',
				}
			}

			// Validate path
			if (!/^\/posts\/[\w-]+$/.test(path)) {
				return {
					success: false,
					status: 400,
					error: 'Invalid path',
				}
			}

			// Check if post exists and is not private
			const slug = path.replace('/posts/', '')
			const post_check = await sqlite_client.execute({
				sql: 'SELECT is_private FROM posts WHERE slug = ?',
				args: [slug],
			})

			if (post_check.rows.length === 0) {
				return {
					success: false,
					status: 404,
					error: 'Post not found',
				}
			}

			const is_private = post_check.rows[0]['is_private']
			if (is_private) {
				return {
					success: false,
					status: 403,
					error: 'Cannot react to private posts',
				}
			}

			await sqlite_client.execute({
				sql: `INSERT INTO reactions (post_url, reaction_type, count) VALUES (?, ?, 1)
				ON CONFLICT (post_url, reaction_type)
				DO UPDATE SET count = count + 1, last_updated = CURRENT_TIMESTAMP;`,
				args: [path, reaction],
			})

			const result = await sqlite_client.execute({
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
		} catch (error) {
			console.warn(
				'Database unavailable for reaction submission:',
				error,
			)
			return {
				success: false,
				status: 500,
				error: 'Database unavailable',
			}
		}
	},
)

export const get_reaction_counts = query(
	v.string(),
	async (pathname: string): Promise<ReactionCount | null> => {
		if (BYPASS_DB_READS.reactions) {
			return null
		}

		// Check server cache first
		const cache_key = `reaction_counts_${pathname}`
		const cached = get_from_cache<ReactionCount | null>(
			cache_key,
			CACHE_DURATIONS.reactions,
		)
		if (cached !== null) {
			return cached
		}

		try {
			const count = {} as ReactionCount

			for (const reaction of reactions) {
				const result = await sqlite_client.execute({
					sql: 'SELECT count FROM reactions WHERE post_url = ? AND reaction_type = ?',
					args: [pathname, reaction.type],
				})

				const reactionCount =
					result.rows.length > 0 ? Number(result.rows[0]['count']) : 0
				count[reaction.type] = reactionCount
			}

			// Cache the result
			set_cache(cache_key, count)
			return count
		} catch (error) {
			console.warn('Database unavailable for reaction counts:', error)
			return null
		}
	},
)
