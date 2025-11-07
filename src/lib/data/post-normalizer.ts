interface DbPost {
	date?: string | null
	is_private?: number | boolean | null
	preview?: string | null
	preview_html?: string | null
	previewHtml?: string | null
	reading_time_minutes?: number | string | null
	reading_time_text?: string | null
	reading_time_seconds?: number | string | null
	reading_time_words?: number | string | null
	slug?: string | null
	tags?: string | string[] | null
	title?: string | null
}

const to_string = (value: unknown, fallback = ''): string => {
	if (typeof value === 'string') return value
	if (value === null || value === undefined) return fallback
	return String(value)
}

const to_number = (value: unknown, fallback = 0): number => {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value
	}
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : fallback
}

const to_boolean = (value: unknown): boolean => {
	if (typeof value === 'boolean') return value
	if (typeof value === 'number') return value === 1
	if (typeof value === 'string') {
		return value === '1' || value.toLowerCase() === 'true'
	}
	return false
}

const parse_tags = (value: unknown): string[] => {
	if (Array.isArray(value)) {
		return value
			.filter((tag): tag is string => typeof tag === 'string')
			.map((tag) => tag.trim())
			.filter(Boolean)
	}

	if (typeof value === 'string') {
		return value
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
	}

	return []
}

export const normalize_post_row = (row: DbPost): Post | null => {
	if (!row) return null

	const slug = to_string(row.slug).trim()
	if (!slug) {
		console.warn('Skipping post row without slug')
		return null
	}

	const title = to_string(row.title).trim()
	if (!title) {
		console.warn('Skipping post row without title', { slug })
		return null
	}

	const date = to_string(row.date)
	if (!date) {
		console.warn('Skipping post row without date', { slug })
		return null
	}

	const preview_html = to_string(row.preview_html ?? row.previewHtml)
	const preview = to_string(row.preview)
	const reading_time_text = to_string(row.reading_time_text)

	return {
		date,
		title,
		tags: parse_tags(row.tags),
		is_private: to_boolean(row.is_private),
		reading_time: {
			text: reading_time_text,
			minutes: to_number(row.reading_time_minutes),
			time: to_number(row.reading_time_seconds),
			words: to_number(row.reading_time_words),
		},
		reading_time_text,
		preview_html,
		preview,
		previewHtml: preview_html,
		slug,
		path: `/posts/${slug}`,
	}
}

export const normalize_posts = (rows: unknown[]): Post[] =>
	rows
		.map((row) => normalize_post_row(row as DbPost))
		.filter((post): post is Post => post !== null)

export type { DbPost }
