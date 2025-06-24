import { turso_client } from '$lib/turso'
import { get_related_posts } from './embeddings'

export async function update_related_posts_table() {
	const client = turso_client()
	const BATCH_SIZE = 20 // Process 20 posts at a time to avoid timeouts
	
	try {
		// Get all post IDs
		const all_posts_result = await client.execute(
			'SELECT post_id FROM post_embeddings',
		)
		const all_post_ids = all_posts_result.rows.map(
			(row: any) => row.post_id,
		)

		console.log(`Found ${all_post_ids.length} posts to process in batches of ${BATCH_SIZE}`)

		// Process posts in batches
		for (let i = 0; i < all_post_ids.length; i += BATCH_SIZE) {
			const batch = all_post_ids.slice(i, i + BATCH_SIZE)
			console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(all_post_ids.length/BATCH_SIZE)} (${batch.length} posts)`)
			
			// Process batch with native SQL for maximum performance
			try {
				const batch_updates = []
				
				for (const post_id of batch) {
					try {
						// Get related posts using optimized native function
						const related_posts = await get_related_posts(post_id, 4)
						const related_posts_json = JSON.stringify(related_posts)

						batch_updates.push({
							sql: `INSERT INTO related_posts (post_id, related_post_ids, last_updated)
									 VALUES (?, ?, CURRENT_TIMESTAMP)
									 ON CONFLICT(post_id) DO UPDATE SET
										 related_post_ids = excluded.related_post_ids,
										 last_updated = CURRENT_TIMESTAMP`,
							args: [post_id, related_posts_json],
						})
					} catch (error) {
						console.error(`Error processing post ${post_id}:`, error)
					}
				}

				// Execute all updates in the batch
				for (const update of batch_updates) {
					await client.execute(update)
				}
				
				console.log(`Completed batch ${Math.floor(i/BATCH_SIZE) + 1}, updated ${batch_updates.length} posts`)
			} catch (error) {
				console.error(`Error processing batch starting at ${i}:`, error)
			}
		}

		console.log('Related posts table update completed')
		return {
			message: 'Related posts updated successfully',
			total_posts: all_post_ids.length,
			batch_size: BATCH_SIZE
		}
	} catch (error) {
		console.error('Error updating related posts table:', error)
		throw error
	}
}
