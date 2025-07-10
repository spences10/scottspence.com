import { turso_client } from '$lib/turso/client'

interface ReactionData {
	path: string
	title: string
	reaction_type: string
	count: number
	total_count: number
}

const fetch_reaction_data = async (): Promise<ReactionData[]> => {
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

		return result.rows.map(row => ({
			path: String(row.path),
			title: String(row.title),
			reaction_type: String(row.reaction_type),
			count: Number(row.count),
			total_count: Number(row.total_count),
		}))
	} catch (error) {
		console.error('Error fetching reaction data:', error)
		throw error
	}
}

const process_leaderboard_data = (
	data: ReactionData[],
): ReactionEntry[] => {
	const leaderboard = new Map<string, any>()

	data.forEach(item => {
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

export const load = async () => {
	try {
		const reaction_data = await fetch_reaction_data()
		const leaderboard: ReactionEntry[] =
			process_leaderboard_data(reaction_data)
		return { leaderboard }
	} catch (error) {
		console.error('Error fetching leaderboard data:', error)
		return { error: 'Failed to load leaderboard data' }
	}
}
