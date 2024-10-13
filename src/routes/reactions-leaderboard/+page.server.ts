import { reactions } from '$lib/reactions-config.js'
import { turso_client } from '$lib/turso/client.js'

const fetch_reaction_data = async (): Promise<ReactionPage[]> => {
	const client = turso_client()
	const result = await client.execute(
		`
    SELECT
      r.post_url,
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
    GROUP BY
      r.post_url, r.reaction_type
    ORDER BY
      total.total_count DESC, r.post_url, r.reaction_type;
    `,
	)

	return result.rows.map(row => ({
		path: String(row.post_url),
		title: String(row.title),
		reaction_type: String(row.reaction_type),
		count: Number(row.count),
		reaction_emoji: reactions.find(
			r => r.type === String(row.reaction_type),
		)?.emoji,
	}))
}

const get_leaderboard_with_ranking = async () => {
	const reaction_data = await fetch_reaction_data()

	const leaderboard = reaction_data.sort((a, b) => b.count - a.count)
	leaderboard.forEach((entry, index) => {
		entry.rank = index + 1
	})

	return leaderboard
}

export const load = async () => {
	try {
		const leaderboard = await get_leaderboard_with_ranking()
		return { leaderboard }
	} catch (error) {
		console.error('Error fetching leaderboard data:', error)
	}
}
