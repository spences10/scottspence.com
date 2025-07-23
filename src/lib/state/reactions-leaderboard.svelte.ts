import { turso_client } from '$lib/turso/client'
import { getContext, setContext } from 'svelte'

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

class ReactionsLeaderboardState {
	data = $state<LeaderboardData>({ leaderboard: [] })
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	private readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
	private readonly BYPASS_DB_READS = true // Set to false to enable DB reads

	async load_leaderboard(): Promise<void> {
		if (this.BYPASS_DB_READS) {
			return // DB reads disabled
		}

		// Check if cache is still valid
		if (
			Date.now() - this.last_fetched < this.CACHE_DURATION &&
			this.data.leaderboard.length > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true
		const client = turso_client()

		try {
			const result = await client.execute(`
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

			const reaction_data: ReactionData[] = result.rows.map(
				(row) => ({
					path: String(row.path),
					title: String(row.title),
					reaction_type: String(row.reaction_type),
					count: Number(row.count),
					total_count: Number(row.total_count),
				}),
			)

			const leaderboard = this.process_leaderboard_data(reaction_data)

			this.data = { leaderboard }
			this.last_fetched = Date.now()
		} catch (error) {
			console.warn(
				'Database unavailable, keeping cached leaderboard:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}

	private process_leaderboard_data(
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
}

const REACTIONS_LEADERBOARD_KEY = Symbol('reactions_leaderboard')

export function set_reactions_leaderboard_state() {
	const state = new ReactionsLeaderboardState()
	setContext(REACTIONS_LEADERBOARD_KEY, state)
	return state
}

export function get_reactions_leaderboard_state(): ReactionsLeaderboardState {
	return getContext<ReactionsLeaderboardState>(
		REACTIONS_LEADERBOARD_KEY,
	)
}

// Fallback function for server-side usage and backward compatibility
export const get_reactions_leaderboard =
	async (): Promise<LeaderboardData> => {
		const BYPASS_DB_READS = true // Set to false to enable DB reads
		if (BYPASS_DB_READS) {
			return { leaderboard: [] }
		}

		const client = turso_client()

		try {
			const result = await client.execute(`
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

			const reaction_data: ReactionData[] = result.rows.map(
				(row) => ({
					path: String(row.path),
					title: String(row.title),
					reaction_type: String(row.reaction_type),
					count: Number(row.count),
					total_count: Number(row.total_count),
				}),
			)

			const leaderboard = process_leaderboard_data(reaction_data)

			return { leaderboard }
		} catch (error) {
			console.warn(
				'Database unavailable, returning empty leaderboard:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return {
				leaderboard: [],
				error: 'Failed to load leaderboard data',
			}
		}
	}

// Helper function for server-side processing
const process_leaderboard_data = (
	data: ReactionData[],
): ReactionEntry[] => {
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
