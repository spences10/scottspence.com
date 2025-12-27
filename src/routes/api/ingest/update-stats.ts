import { sqlite_client } from '$lib/sqlite/client'

const update_monthly_stats = `
  INSERT OR REPLACE INTO analytics_monthly (pathname, year_month, views, unique_visitors)
  SELECT 
    pathname,
    strftime('%Y-%m', timestamp) as year_month,
    SUM(views) as views,
    SUM(uniques) as unique_visitors
  FROM analytics_pages
  WHERE pathname LIKE '/posts/%'
  GROUP BY pathname, year_month;
`

const update_yearly_stats = `
  INSERT OR REPLACE INTO analytics_yearly (pathname, year, views, unique_visitors)
  SELECT 
    pathname,
    strftime('%Y', timestamp) as year,
    SUM(views) as views,
    SUM(uniques) as unique_visitors
  FROM analytics_pages
  WHERE pathname LIKE '/posts/%'
  GROUP BY pathname, year;
`

const update_all_time_stats = `
  INSERT OR REPLACE INTO analytics_all_time (pathname, views, unique_visitors)
  SELECT 
    pathname,
    SUM(views) as views,
    SUM(uniques) as unique_visitors
  FROM analytics_pages
  WHERE pathname LIKE '/posts/%'
  GROUP BY pathname;
`

export const update_stats = async () => {
	const client = sqlite_client
	try {
		// Use prepare().run() for INSERT statements instead of execute()
		const monthly_stmt = client.prepare(update_monthly_stats)
		monthly_stmt.run()

		const yearly_stmt = client.prepare(update_yearly_stats)
		yearly_stmt.run()

		const all_time_stmt = client.prepare(update_all_time_stats)
		all_time_stmt.run()

		return { success: true, message: 'Stats updated successfully' }
	} catch (error) {
		console.error('Error updating stats:', error)
		throw new Error(
			`Failed to update stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
		)
	}
}
