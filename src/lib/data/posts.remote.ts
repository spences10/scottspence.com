import { query } from '$app/server'
import { sqlite_client } from '$lib/sqlite/client'

export const get_posts = query(async (): Promise<Post[]> => {
	try {
		const posts_result = await sqlite_client.execute(
			'SELECT * FROM posts ORDER BY date DESC;'
		)
		return posts_result.rows as unknown as Post[]
	} catch (error) {
		console.warn('Database unavailable:', error)
		return []
	}
})

export const get_post_by_slug = query(async (slug: string): Promise<Post | null> => {
	try {
		const result = await sqlite_client.execute({
			sql: 'SELECT * FROM posts WHERE slug = ?',
			args: [slug]
		})
		return result.rows[0] as unknown as Post || null
	} catch (error) {
		console.warn('Database unavailable:', error)
		return null
	}
})