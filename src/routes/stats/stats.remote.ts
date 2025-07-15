import { query } from '$app/server'
import { turso_client } from '$lib/turso/client'
import { z } from 'zod'

const SiteStatsSchema = z.object({
	total_posts: z.number(),
	total_visits: z.number(),
	total_pageviews: z.number(),
	avg_reading_time: z.number(),
	popular_tags: z.array(
		z.object({
			tag: z.string(),
			count: z.number(),
		}),
	),
	monthly_stats: z.array(
		z.object({
			month: z.string(),
			visits: z.number(),
			pageviews: z.number(),
		}),
	),
})

// Get comprehensive site statistics
export const get_site_stats = query(async () => {
	const client = turso_client()

	// Get total posts
	const posts_result = await client.execute({
		sql: `
        SELECT COUNT(*) as total_posts, AVG(reading_time_minutes) as avg_reading_time
        FROM posts 
        WHERE is_private = 0
      `,
	})

	// Get total visits and pageviews
	const traffic_result = await client.execute({
		sql: `
        SELECT SUM(visits) as total_visits, SUM(pageviews) as total_pageviews
        FROM post_analytics
      `,
	})

	// Get popular tags
	const tags_result = await client.execute({
		sql: `
        SELECT 
          tag,
          COUNT(*) as count
        FROM (
          SELECT TRIM(value) as tag
          FROM posts, json_each(posts.tags)
          WHERE is_private = 0
        )
        GROUP BY tag
        ORDER BY count DESC
        LIMIT 10
      `,
	})

	// Get monthly stats
	const monthly_result = await client.execute({
		sql: `
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(visits) as visits,
          SUM(pageviews) as pageviews
        FROM post_analytics
        WHERE date >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
      `,
	})

	return SiteStatsSchema.parse({
		total_posts: posts_result.rows[0].total_posts as number,
		total_visits:
			(traffic_result.rows[0].total_visits as number) || 0,
		total_pageviews:
			(traffic_result.rows[0].total_pageviews as number) || 0,
		avg_reading_time:
			(posts_result.rows[0].avg_reading_time as number) || 0,
		popular_tags: tags_result.rows.map((row) => ({
			tag: row.tag as string,
			count: row.count as number,
		})),
		monthly_stats: monthly_result.rows.map((row) => ({
			month: row.month as string,
			visits: row.visits as number,
			pageviews: row.pageviews as number,
		})),
	})
})
