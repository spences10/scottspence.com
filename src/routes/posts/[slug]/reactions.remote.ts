import { form, query } from '$app/server'
import { turso_client } from '$lib/turso/client'
import * as v from 'valibot'

const ReactionSchema = v.object({
	reaction_type: v.string(),
	count: v.number(),
})

const ReactionCountsSchema = v.array(ReactionSchema)

// Get reaction counts from existing aggregated table
export const get_reaction_counts = query(
	v.string(),
	async (pathname) => {
		const client = turso_client()
		const result = await client.execute({
			sql: `
        SELECT 
          reaction_type,
          count
        FROM reactions 
        WHERE post_url = ?
        ORDER BY last_updated DESC
      `,
			args: [pathname],
		})

		const reactions_data = result.rows.map((row) => ({
			reaction_type: row.reaction_type as string,
			count: row.count as number,
		}))

		return v.parse(ReactionCountsSchema, reactions_data)
	},
)

// Add reaction using existing schema (increment count)
export const add_reaction = form(async (data: FormData) => {
	const client = turso_client()
	const pathname = data.get('pathname') as string
	const reaction_type = data.get('reaction_type') as string

	// Use existing upsert logic from current API
	await client.execute({
		sql: `INSERT INTO reactions (post_url, reaction_type, count) VALUES (?, ?, 1)
            ON CONFLICT (post_url, reaction_type)
            DO UPDATE SET count = count + 1, last_updated = CURRENT_TIMESTAMP`,
		args: [pathname, reaction_type],
	})

	// Refresh the query to sync optimistic update with real data
	await get_reaction_counts(pathname).refresh()

	return { success: true }
})
