import { form, query } from '$app/server'
import { turso_client } from '$lib/turso/client'
import * as v from 'valibot'

// Schema for popular posts
const PopularPostSchema = v.object({
	period: v.picklist(['day', 'month', 'year']),
	id: v.number(),
	pathname: v.string(),
	title: v.string(),
	pageviews: v.number(),
	visits: v.number(),
	date_grouping: v.string(),
	last_updated: v.string(),
})

const PopularPostsResponseSchema = v.array(PopularPostSchema)

export const get_popular_posts = query(
	v.optional(v.picklist(['day', 'month', 'year']), 'year'),
	async (period) => {
		const client = turso_client()
		const whereClause = 'WHERE pp.date_grouping = ?'
		const args = [period]

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

		const validated_results = v.parse(PopularPostsResponseSchema,
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
