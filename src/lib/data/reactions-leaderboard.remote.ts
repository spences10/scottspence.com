import { query } from '$app/server'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'

interface ReactionData {
	path: string
	title: string
	reaction_type: string
	count: number
	total_count: number
}

interface LeaderboardData {
	leaderboard: ReactionEntry[]
	error?: string
}

const CACHE_KEY = 'reactions_leaderboard'

export const get_reactions_leaderboard = query(
	async (): Promise<LeaderboardData> => {
		if (BYPASS_DB_READS.reactions_leaderboard) {
			return { leaderboard: [] }
		}

		// Check server cache first
		const cached = get_from_cache<LeaderboardData>(
			CACHE_KEY,
			CACHE_DURATIONS.reactions_leaderboard,
		)
		if (cached) {
			return cached
		}

		try {
			const db_result = await sqlite_client.execute(`
			SELECT
				r.post_url as path,
				p.title,
				r.reaction_type,
				r.count,
				total.total_count
			FROM
				reactions r
				JOIN posts p ON r.post_url = '/posts/' || p.slug
				JOIN (
					SELECT
						post_url,
						SUM(count) as total_count
					FROM
						reactions
					GROUP BY
						post_url
				) total ON r.post_url = total.post_url
			WHERE
				p.is_private = false
			ORDER BY
				total.total_count DESC, r.post_url, r.reaction_type;
		`)

			const reaction_data: ReactionData[] = db_result.rows.map(
				(row) => ({
					path: String(row.path),
					title: String(row.title),
					reaction_type: String(row.reaction_type),
					count: Number(row.count),
					total_count: Number(row.total_count),
				}),
			)

			const leaderboard = process_leaderboard_data(reaction_data)
			const data = { leaderboard }

			// Cache the result
			set_cache(CACHE_KEY, data)
			return data
		} catch (error) {
			console.warn(
				'Database unavailable for reactions leaderboard:',
				error,
			)
			return {
				leaderboard: [],
				error: 'Failed to load leaderboard data',
			}
		}
	},
)

function process_leaderboard_data(
	data: ReactionData[],
): ReactionEntry[] {
	const leaderboard = new Map<string, any>()

	data.forEach((item) => {
		if (!leaderboard.has(item.path)) {
			leaderboard.set(item.path, {
				path: item.path,
				title: item.title,
				total_count: item.total_count,
				likes: 0,
				hearts: 0,
				poops: 0,
				parties: 0,
			})
		}
		const entry = leaderboard.get(item.path)
		entry[item.reaction_type] = item.count
	})

	return Array.from(leaderboard.values())
		.sort((a, b) => b.total_count - a.total_count)
		.map((entry, index) => ({ ...entry, rank: index + 1 }))
}
