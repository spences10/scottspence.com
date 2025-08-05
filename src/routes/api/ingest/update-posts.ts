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
	const batch_statements = posts.map((post) => {
		// Check for valid date first
		const postDate = new Date(post.date)
		if (isNaN(postDate.getTime())) {
			console.error(`Invalid date for post ${post.slug}:`, post.date)
		}

		// Validate and clean data types
		const args = [
			isNaN(postDate.getTime())
				? new Date().toISOString()
				: postDate.toISOString(),
			(post.is_private ?? false) ? 1 : 0, // Convert boolean to integer
			String(post.preview ?? ''),
			String(post.preview_html ?? post.previewHtml ?? ''),
			Number(post.reading_time?.minutes ?? 0),
			String(post.reading_time?.text ?? ''),
			Number(Math.round((post.reading_time?.time ?? 0) / 1000)),
			Number(post.reading_time?.words ?? 0),
			String(post.slug || ''),
			String(
				Array.isArray(post.tags)
					? post.tags.join(',')
					: (post.tags ?? ''),
			),
			String(post.title ?? ''),
			new Date().toISOString(),
		]

		// Validate args for SQLite compatibility
		args.forEach((arg, index) => {
			const validTypes = ['string', 'number', 'boolean', 'bigint']
			if (arg !== null && !validTypes.includes(typeof arg)) {
				console.error(
					`Invalid type at index ${index} for post ${post.slug}:`,
					typeof arg,
					arg,
				)
				throw new Error(
					`Invalid type ${typeof arg} at index ${index} for post ${post.slug}`,
				)
			}
			if (arg !== null && typeof arg === 'number' && isNaN(arg)) {
				throw new Error(
					`Invalid NaN value at index ${index} for post ${post.slug}`,
				)
			}
		})

		return {
			sql: `INSERT INTO posts (date, is_private, preview, preview_html, reading_time_minutes, reading_time_text, reading_time_seconds, reading_time_words, slug, tags, title, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (slug) DO UPDATE SET date = EXCLUDED.date, is_private = EXCLUDED.is_private, preview = EXCLUDED.preview, preview_html = EXCLUDED.preview_html, reading_time_minutes = EXCLUDED.reading_time_minutes, reading_time_text = EXCLUDED.reading_time_text, reading_time_seconds = EXCLUDED.reading_time_seconds, reading_time_words = EXCLUDED.reading_time_words, tags = EXCLUDED.tags, title = EXCLUDED.title, last_updated = EXCLUDED.last_updated`,
			args,
		}
	})

	// Execute the batch
	try {
		client.batch(batch_statements)
		return {
			message: `Posts updated successfully: ${posts.length} posts processed`,
		}
	} catch (error) {
		console.error('Error performing batch insert/update:', error)
		throw error
	}
}
