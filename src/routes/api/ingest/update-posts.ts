import { clear_cache } from '#lib/cache/server-cache.js';
import { sqlite_client } from '#lib/sqlite/client.js';

// Renamed or deleted posts keep their old row otherwise, and stay
// listed in the sitemap, RSS and post lists as dead links.
export const prune_posts_statements = (
	slugs: (string | null | undefined)[],
) => {
	const current_slugs = slugs.filter(
		(slug): slug is string => !!slug,
	);
	// Never wipe the table if no Markdown files were read
	if (current_slugs.length === 0) return [];

	return [
		{
			sql: `DELETE FROM posts WHERE slug NOT IN (${current_slugs.map(() => '?').join(', ')})`,
			args: current_slugs,
		},
	];
};

export const update_posts = async () => {
	const client = sqlite_client;

	// Fetch posts from local Markdown files
	const post_files = import.meta.glob<{ metadata: Post }>(
		'../../../../posts/**/*.md',
	);
	const posts: Post[] = await Promise.all(
		Object.keys(post_files).map(async (path) => {
			const resolved = await post_files[path]();
			const { metadata } = resolved;
			const slug = path.split('/').pop()?.slice(0, -3) ?? '';
			return { ...metadata, slug };
		}),
	);

	// Prepare batch statements
	const batch_statements = posts.map((post) => {
		// Check for valid date first
		const postDate = new Date(post.date);
		if (isNaN(postDate.getTime())) {
			console.error(`Invalid date for post ${post.slug}:`, post.date);
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
		];

		// Validate args for SQLite compatibility
		args.forEach((arg, index) => {
			const validTypes = ['string', 'number', 'boolean', 'bigint'];
			if (arg !== null && !validTypes.includes(typeof arg)) {
				console.error(
					`Invalid type at index ${index} for post ${post.slug}:`,
					typeof arg,
					arg,
				);
				throw new Error(
					`Invalid type ${typeof arg} at index ${index} for post ${post.slug}`,
				);
			}
			if (arg !== null && typeof arg === 'number' && isNaN(arg)) {
				throw new Error(
					`Invalid NaN value at index ${index} for post ${post.slug}`,
				);
			}
		});

		return {
			sql: `INSERT INTO posts (date, is_private, preview, preview_html, reading_time_minutes, reading_time_text, reading_time_seconds, reading_time_words, slug, tags, title, last_updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (slug) DO UPDATE SET date = EXCLUDED.date, is_private = EXCLUDED.is_private, preview = EXCLUDED.preview, preview_html = EXCLUDED.preview_html, reading_time_minutes = EXCLUDED.reading_time_minutes, reading_time_text = EXCLUDED.reading_time_text, reading_time_seconds = EXCLUDED.reading_time_seconds, reading_time_words = EXCLUDED.reading_time_words, tags = EXCLUDED.tags, title = EXCLUDED.title, last_updated = EXCLUDED.last_updated`,
			args,
		};
	});

	// Execute the batch
	try {
		client.batch([
			...batch_statements,
			...prune_posts_statements(posts.map((post) => post.slug)),
		]);
		// Post lists, tags and single posts are cached for 24 hours
		clear_cache();
		return {
			message: `Posts updated successfully: ${posts.length} posts processed`,
		};
	} catch (error) {
		console.error('Error performing batch insert/update:', error);
		throw error;
	}
};
