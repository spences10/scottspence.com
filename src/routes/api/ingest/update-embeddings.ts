import { get_posts } from '$lib/posts'
import fs from 'node:fs/promises'
import path from 'node:path'
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
						// Read the markdown file directly
						const file_path = path.join(
							process.cwd(),
							'posts',
							`${post.slug}.md`,
						)
						const file_contents = await fs.readFile(
							file_path,
							'utf-8',
						)

						await store_post_embedding(post.slug, file_contents)
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
