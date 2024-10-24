import { get_posts } from '$lib/posts'
import {
	get_post_embedding,
	store_post_embedding,
} from './embeddings'

export const update_embeddings = async () => {
	try {
		const { posts } = await get_posts()
		const total_posts = posts.length
		console.log(
			`Starting to build embeddings for ${total_posts} posts`,
		)

		let new_embeddings = 0
		let existing_embeddings = 0

		for (const post of posts) {
			if (post.slug) {
				try {
					const existing_embedding = await get_post_embedding(
						post.slug,
					)

					if (!existing_embedding) {
						const content = `${post.title}\n${post.content}`
						await store_post_embedding(post.slug, content)
						new_embeddings++
					} else {
						existing_embeddings++
					}
				} catch (error) {
					console.error(
						`Error processing embedding for post ${post.slug}:`,
						error,
					)
				}
			}
		}
		console.log(
			`Finished building embeddings. New: ${new_embeddings}, Existing: ${existing_embeddings}`,
		)
		return {
			message: 'Embeddings updated',
			new: new_embeddings,
			existing: existing_embeddings,
		}
	} catch (error) {
		console.error('Error in update_embeddings:', error)
		throw error
	}
}
