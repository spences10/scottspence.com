import { get_posts } from '#lib/posts.js';
import { log_task_event } from '#lib/server/task-log-context.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
	get_post_embedding,
	store_post_embedding,
} from './embeddings';

export const update_embeddings = async () => {
	try {
		const { posts } = await get_posts();
		const total_posts = posts.length;
		log_task_event('info', 'Starting embedding updates', {
			total: total_posts,
		});
		console.log(
			`Starting to build embeddings for ${total_posts} posts`,
		);

		let new_embeddings = 0;
		let existing_embeddings = 0;

		for (const post of posts) {
			if (post.slug) {
				try {
					const existing_embedding = await get_post_embedding(
						post.slug,
					);

					if (!existing_embedding) {
						// Read the markdown file directly
						const file_path = path.join(
							process.cwd(),
							'posts',
							`${post.slug}.md`,
						);

						try {
							await fs.access(file_path);
							const file_contents = await fs.readFile(
								file_path,
								'utf-8',
							);

							await store_post_embedding(post.slug, file_contents);
							new_embeddings++;
						} catch (file_error) {
							log_task_event(
								'warn',
								file_error instanceof Error
									? file_error.message
									: 'A post embedding could not be updated',
							);
							console.warn(
								`Skipping ${post.slug}: markdown file not found`,
								file_error,
							);
							continue;
						}
					} else {
						existing_embeddings++;
					}
				} catch (error) {
					log_task_event(
						'warn',
						error instanceof Error
							? error.message
							: 'A post embedding could not be updated',
					);
					console.error(
						`Error processing embedding for post ${post.slug}:`,
						error,
					);
				}
			}
		}
		console.log(
			`Finished building embeddings. New: ${new_embeddings}, Existing: ${existing_embeddings}`,
		);
		return {
			message: 'Embeddings updated',
			new: new_embeddings,
			existing: existing_embeddings,
		};
	} catch (error) {
		console.error('Error in update_embeddings:', error);
		throw error;
	}
};
