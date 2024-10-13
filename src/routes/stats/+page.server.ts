import { get_posts } from '$lib/posts'
import { turso_client } from '$lib/turso'

export let load = async () => {
	const posts = await get_posts()

	const client = turso_client()

	const sql = `
    SELECT 
      DATE(timestamp) AS date,
      SUM(views) AS total_page_views,
      SUM(uniques) AS total_unique_visits
    FROM 
      analytics_pages
    WHERE 
      pathname = '/posts/use-chrome-in-ubuntu-wsl' AND 
      strftime('%Y', timestamp) = '2021'
    GROUP BY 
      DATE(timestamp);
  `

	let analytics
	try {
		const result = await client.execute(sql)
		// Convert the data to a plain object if necessary
		analytics = result.rows.map(row => ({ ...row }))
	} catch (error) {
		console.error('Error fetching from Turso DB:', error)
		return { posts, error: 'Error fetching analytics data' }
	} finally {
		if (client && typeof client.close === 'function') {
			client.close()
		}
	}

	return { posts, analytics }
}
