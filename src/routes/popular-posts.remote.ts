import { form, query } from '$app/server'
import { turso_client } from '$lib/turso/client'
import { z } from 'zod'

// Schema for popular posts
const PopularPostSchema = z.object({
	period: z.enum(['day', 'month', 'year']),
	id: z.number(),
	pathname: z.string(),
	title: z.string(),
	pageviews: z.number(),
	visits: z.number(),
	date_grouping: z.string(),
	last_updated: z.string(),
})

const PopularPostsResponseSchema = z.array(PopularPostSchema)

export const get_popular_posts = query(
	z.enum(['day', 'month', 'year']).optional(),
	async (period) => {
		const client = turso_client()
		const whereClause = period
			? 'WHERE pp.date_grouping = ?'
			: "WHERE pp.date_grouping IN ('day', 'month', 'year')"

		const args = period ? [period] : []

		const result = await client.execute({
			sql: `
        SELECT
          pp.date_grouping AS period,
          pp.id,
          pp.pathname,
          p.title,
          pp.pageviews,
          pp.visits,
          pp.date_grouping,
          pp.last_updated,
          ROW_NUMBER() OVER (PARTITION BY pp.date_grouping ORDER BY pp.pageviews DESC) as rn
        FROM popular_posts pp
        JOIN posts p ON pp.pathname = '/posts/' || p.slug
        ${whereClause}
        ORDER BY pp.date_grouping, pp.pageviews DESC
      `,
			args,
		})

		const validated_results = PopularPostsResponseSchema.parse(
			result.rows
				.filter((row) => (row.rn as number) <= 20)
				.map((row) => ({
					period: row.period,
					id: row.id,
					pathname: row.pathname,
					title: row.title,
					pageviews: row.pageviews,
					visits: row.visits,
					date_grouping: row.date_grouping,
					last_updated: row.last_updated,
				})),
		)

		return validated_results
	},
)

// Background update function
export const update_popular_posts = form(async () => {
	// Move current /api/ingest/update-popular-posts logic here
	// This runs as a background task, not blocking user requests

	// 1. Fetch from Fathom API
	// 2. Process and aggregate data
	// 3. Update popular_posts table
	// 4. Refresh popular posts cache

	await get_popular_posts().refresh()
})
