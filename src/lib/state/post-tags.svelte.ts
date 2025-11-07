import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { get_posts } from '$lib/state/posts.svelte'

interface PostsByTag {
	[tag: string]: Post[]
}

interface PostTagsData {
	tags: string[]
	posts_by_tag: PostsByTag
}

const to_tag_array = (value: unknown): string[] => {
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

const CACHE_KEY = 'post_tags'

class PostTagsState {
	tags = $state<string[]>([])
	posts_by_tag = $state<PostsByTag>({})
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	async load_post_tags(): Promise<void> {
		if (BYPASS_DB_READS.post_tags) {
			return // DB reads disabled
		}

		// Check server cache first
		const server_cached = get_from_cache<PostTagsData>(
			CACHE_KEY,
			CACHE_DURATIONS.post_tags,
		)
		if (server_cached) {
			this.tags = server_cached.tags
			this.posts_by_tag = server_cached.posts_by_tag
			this.last_fetched = Date.now()
			return
		}

		// Check client cache
		if (
			Date.now() - this.last_fetched < CACHE_DURATIONS.post_tags &&
			this.tags.length > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true

		try {
			const { posts } = await get_posts()
			const posts_by_tag: PostsByTag = {}

			posts.forEach((post: Post) => {
				if (post.is_private) return

				const tags = to_tag_array(post.tags)

				tags.forEach((tag: string) => {
					if (!posts_by_tag[tag]) {
						posts_by_tag[tag] = []
					}
					posts_by_tag[tag].push(post)
				})
			})

			const tags = Object.keys(posts_by_tag).sort()
			const tag_data: PostTagsData = { tags, posts_by_tag }

			// Update both caches
			this.tags = tags
			this.posts_by_tag = posts_by_tag
			this.last_fetched = Date.now()
			set_cache(CACHE_KEY, tag_data)
		} catch (error) {
			console.warn(
				'Error loading post tags, keeping cached data:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}
}

// Single universal instance shared everywhere
export const post_tags_state = new PostTagsState()

// Legacy context functions for backward compatibility
export function set_post_tags_state() {
	return post_tags_state
}

export function get_post_tags_state(): PostTagsState {
	return post_tags_state
}

// Fallback function for server-side usage - now uses server cache
export const get_post_tags = async (): Promise<PostTagsData> => {
	if (BYPASS_DB_READS.post_tags) {
		return { tags: [], posts_by_tag: {} }
	}

	// Check server cache first
	const cached = get_from_cache<PostTagsData>(
		CACHE_KEY,
		CACHE_DURATIONS.post_tags,
	)
	if (cached) {
		return cached
	}

	try {
		const { posts } = await get_posts()
		const posts_by_tag: PostsByTag = {}

		posts.forEach((post: Post) => {
			if (post.is_private) return

			const tags = to_tag_array(post.tags)

			tags.forEach((tag: string) => {
				if (!posts_by_tag[tag]) {
					posts_by_tag[tag] = []
				}
				posts_by_tag[tag].push(post)
			})
		})

		const tags = Object.keys(posts_by_tag).sort()
		const tag_data: PostTagsData = { tags, posts_by_tag }

		// Cache the result
		set_cache(CACHE_KEY, tag_data)

		return tag_data
	} catch (error) {
		console.warn(
			'Error loading post tags, returning empty data:',
			error instanceof Error ? error.message : 'Unknown error',
		)
		return { tags: [], posts_by_tag: {} }
	}
}
