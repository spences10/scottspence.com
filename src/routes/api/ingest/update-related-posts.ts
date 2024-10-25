import { turso_client } from '$lib/turso'
import { get_related_posts } from './embeddings'

export async function update_related_posts_table() {
	const client = turso_client()
	try {
		// Get all post IDs
		const all_posts_result = await client.execute(
			'SELECT post_id FROM post_embeddings',
		)
		const all_post_ids = all_posts_result.rows.map(
			(row: any) => row.post_id,
		)

		console.log(`Found ${all_post_ids.length} posts to process`)

		for (const post_id of all_post_ids) {
			try {
				console.log(`Processing post_id: ${post_id}`)
				// Get related posts
				const related_posts = await get_related_posts(post_id, 4)
				console.log(
					`Found ${related_posts.length} related posts for ${post_id}`,
				)
				const related_posts_json = JSON.stringify(related_posts)

				// Update the related_posts table
				await client.execute({
					sql: `
            INSERT INTO related_posts (post_id, related_post_ids, last_updated)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(post_id) DO UPDATE SET
              related_post_ids = excluded.related_post_ids,
              last_updated = CURRENT_TIMESTAMP
          `,
					args: [post_id, related_posts_json],
				})
				console.log(`Updated related posts for ${post_id}`)
			} catch (error) {
				console.error(`Error processing post ${post_id}:`, error)
			}
		}

		console.log('Related posts table update completed')
	} catch (error) {
		console.error('Error updating related posts table:', error)
	}
}
