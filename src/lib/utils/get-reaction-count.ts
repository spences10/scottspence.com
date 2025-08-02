import { BYPASS_DB_READS } from '$lib/cache/server-cache'
import { reactions } from '$lib/reactions-config'
import { turso_client } from '$lib/turso'

export const get_reaction_count_data = async (
	pathname: string,
): Promise<{ count: ReactionCount } | null> => {
	if (BYPASS_DB_READS.reactions) {
		return null
	}

	try {
		const client = turso_client()
		const count = {} as ReactionCount

		for (const reaction of reactions) {
			const result = await client.execute({
				sql: 'SELECT count FROM reactions WHERE post_url = ? AND reaction_type = ?',
				args: [pathname, reaction.type],
			})

			const reactionCount =
				result.rows.length > 0 ? Number(result.rows[0]['count']) : 0
			count[reaction.type] = reactionCount
		}

		return { count }
	} catch (error) {
		console.warn(
			'Database unavailable for reaction counts:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return null
	}
}
