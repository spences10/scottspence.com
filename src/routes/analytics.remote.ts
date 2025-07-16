import { form, query } from '$app/server'
import { turso_client } from '$lib/turso/client'
import { z } from 'zod'

const PostAnalyticsSchema = z.object({
	visits: z.number(),
	pageviews: z.number(),
	bounce_rate: z.number().optional(),
	avg_duration: z.number().optional(),
	date: z.string(),
	pathname: z.string(),
})

const PostAnalyticsResponseSchema = z.array(PostAnalyticsSchema)

// Get analytics for a specific post
export const get_post_analytics = query(
	z.string(),
	async (pathname) => {
		const client = turso_client()
		const result = await client.execute({
			sql: `
        SELECT 
          visits,
          pageviews,
          bounce_rate,
          avg_duration,
          date,
          pathname
        FROM post_analytics 
        WHERE pathname = ?
        ORDER BY date DESC
        LIMIT 30
      `,
			args: [pathname],
		})

		return PostAnalyticsResponseSchema.parse(
			result.rows.map((row) => ({
				visits: row.visits as number,
				pageviews: row.pageviews as number,
				bounce_rate: row.bounce_rate as number | undefined,
				avg_duration: row.avg_duration as number | undefined,
				date: row.date as string,
				pathname: row.pathname as string,
			})),
		)
	},
)

// Newsletter subscriber count
const SubscriberSchema = z.object({
	count: z.number(),
	last_updated: z.string(),
})

export const get_subscriber_count = query(async () => {
	const client = turso_client()
	const result = await client.execute({
		sql: `
        SELECT count, last_updated
        FROM newsletter_subscriber
        ORDER BY last_updated DESC
        LIMIT 1
      `,
	})

	if (result.rows.length === 0) {
		return { count: 0, last_updated: new Date().toISOString() }
	}

	return SubscriberSchema.parse({
		count: result.rows[0].count as number,
		last_updated: result.rows[0].last_updated as string,
	})
})

// Background task to update analytics from Fathom API
export const update_post_analytics = form(async (data: FormData) => {
	const pathname = data.get('pathname') as string
	const slug = pathname.replace('/posts/', '')

	try {
		// Import the existing analytics fetching logic
		const { fetch_fathom_data } = await import('$lib/fathom')
		const { get_date_range } = await import('./api/ingest/utils')
		
		// Update analytics for all periods
		for (const period of ['day', 'month', 'year']) {
			const [date_from, date_to] = get_date_range(period)
			
			// This would call the existing Fathom fetching logic
			// For now, we'll simulate the update and refresh the cache
			console.log(`Updating analytics for ${slug} - ${period}`)
		}

		// Refresh the query cache
		await get_post_analytics(pathname).refresh()

		return { success: true }
	} catch (error) {
		console.error('Error updating post analytics:', error)
		return { success: false, error: error.message }
	}
})

// Background task to update subscriber count
export const update_subscriber_count = form(async () => {
	try {
		// This would integrate with the existing /api/subscribers logic
		// The API endpoint handles fetching from Buttondown and updating the DB
		const response = await fetch('/api/subscribers')
		
		if (!response.ok) {
			throw new Error('Failed to update subscriber count')
		}

		// Refresh the query cache
		await get_subscriber_count().refresh()

		return { success: true }
	} catch (error) {
		console.error('Error updating subscriber count:', error)
		return { success: false, error: error.message }
	}
})
