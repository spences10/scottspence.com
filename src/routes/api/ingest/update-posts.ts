import { sqlite_client } from '$lib/sqlite/client'

export const update_posts = async () => {
	const client = sqlite_client

	// Fetch posts from local Markdown files
	const posts: Post[] = await Promise.all(
		Object.entries(import.meta.glob('../../../../posts/**/*.md')).map(
			async ([path, resolver]) => {
				const resolved = (await resolver()) as { metadata: Post }
				const { metadata } = resolved
				const slug = path.split('/').pop()?.slice(0, -3) ?? ''
				return { ...metadata, slug }
			},
		),
	)

	// Prepare batch statements
	const batch_statements = posts.map(post => {
		return {
			sql: `
				INSERT INTO posts (
					date, is_private, preview, preview_html, 
					reading_time_minutes, reading_time_text, 
					reading_time_seconds, reading_time_words, 
					slug, tags, title, last_updated
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON CONFLICT (slug) DO UPDATE SET 
					date = EXCLUDED.date,
					is_private = EXCLUDED.is_private,
					preview = EXCLUDED.preview,
					preview_html = EXCLUDED.preview_html,
					reading_time_minutes = EXCLUDED.reading_time_minutes,
					reading_time_text = EXCLUDED.reading_time_text,
					reading_time_seconds = EXCLUDED.reading_time_seconds,
					reading_time_words = EXCLUDED.reading_time_words,
					tags = EXCLUDED.tags,
					title = EXCLUDED.title,
					last_updated = EXCLUDED.last_updated;
			`,
			args: [
				new Date(post.date).toISOString(),
				post.is_private ?? false,
				post.preview ?? '',
				post.previewHtml ?? '',
				post.reading_time.minutes,
				post.reading_time.text,
				post.reading_time.time / 1000,
				post.reading_time.words,
				post.slug,
				post.tags?.join(',') ?? '',
				post.title ?? '',
				new Date().toISOString(),
			],
		}
	})

	// Execute the batch
	try {
		await client.batch(batch_statements)
		return { message: 'Posts updated' }
	} catch (error) {
		console.error('Error performing batch insert/update:', error)
		throw error // Re-throw the error to be caught by the caller
	}
}
