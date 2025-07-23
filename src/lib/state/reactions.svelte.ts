import { reactions } from '$lib/reactions-config'
import { ratelimit } from '$lib/redis'
import { turso_client } from '$lib/turso/client'
import { fail } from '@sveltejs/kit'
import { getContext, setContext } from 'svelte'

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

class ReactionsState {
	cache = $state<Map<string, { count: number; timestamp: number }>>(
		new Map(),
	)
	submitting = $state<Set<string>>(new Set())

	private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

	async submit_reaction(
		reaction: string,
		path: string,
		ip: string,
	): Promise<ReactionResult> {
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

		const submission_key = `${path}-${reaction}`

		// Prevent concurrent submissions
		if (this.submitting.has(submission_key)) {
			return {
				success: false,
				status: 400,
				error: 'Submission in progress',
			}
		}

		this.submitting.add(submission_key)
		const client = turso_client()

		try {
			// Check if post exists and is not private
			const slug = path.replace('/posts/', '')
			const post_check = await client.execute({
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

			// Update cache
			this.cache.set(submission_key, {
				count,
				timestamp: Date.now(),
			})

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
				error instanceof Error ? error.message : 'Unknown error',
			)
			return {
				success: false,
				status: 500,
				error: 'Database unavailable',
			}
		} finally {
			this.submitting.delete(submission_key)
		}
	}

	get_cached_count(path: string, reaction: string): number | null {
		const cache_key = `${path}-${reaction}`
		const cached = this.cache.get(cache_key)

		if (
			cached &&
			Date.now() - cached.timestamp < this.CACHE_DURATION
		) {
			return cached.count
		}

		return null
	}
}

const REACTIONS_KEY = Symbol('reactions')

export function set_reactions_state() {
	const state = new ReactionsState()
	setContext(REACTIONS_KEY, state)
	return state
}

export function get_reactions_state(): ReactionsState {
	return getContext<ReactionsState>(REACTIONS_KEY)
}

// Fallback function for server-side form actions
export const submit_reaction = async (
	reaction: string,
	path: string,
	ip: string,
): Promise<any> => {
	// Rate limiting
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

	// Validate reaction type
	if (!allowed_reactions.includes(reaction)) {
		return fail(400, { error: 'Invalid reaction type' })
	}

	// Validate path
	if (!/^\/posts\/[\w-]+$/.test(path)) {
		return fail(400, { error: 'Invalid path' })
	}

	const client = turso_client()

	try {
		// Check if post exists and is not private
		const slug = path.replace('/posts/', '')
		const post_check = await client.execute({
			sql: 'SELECT is_private FROM posts WHERE slug = ?',
			args: [slug],
		})

		if (post_check.rows.length === 0) {
			return fail(404, { error: 'Post not found' })
		}

		const is_private = post_check.rows[0]['is_private']
		if (is_private) {
			return fail(403, { error: 'Cannot react to private posts' })
		}

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
	} catch (error) {
		console.warn(
			'Database unavailable for reaction submission:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return fail(500, { error: 'Database unavailable' })
	}
}
