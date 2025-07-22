// Universal reactive state for related posts with Svelte 5 runes
import { getContext, setContext } from 'svelte'

interface RelatedPost {
	slug: string
	title: string
}

class RelatedPostsState {
	cache = $state<
		Map<string, { posts: RelatedPost[]; timestamp: number }>
	>(new Map())
	loading = $state<Set<string>>(new Set())

	private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour

	async load_related_posts(post_id: string): Promise<RelatedPost[]> {
		// Check cache first
		const cached = this.cache.get(post_id)
		if (
			cached &&
			Date.now() - cached.timestamp < this.CACHE_DURATION
		) {
			return cached.posts
		}

		// Prevent concurrent requests for the same post
		if (this.loading.has(post_id)) {
			return cached?.posts || []
		}

		this.loading.add(post_id)

		try {
			const response = await fetch(
				`/api/related-posts?post_id=${post_id}`,
			)

			if (!response.ok) {
				console.warn(`Failed to fetch related posts for ${post_id}`)
				return []
			}

			const data = await response.json()
			const related_posts = data.related_posts || []

			// Cache the result
			this.cache.set(post_id, {
				posts: related_posts,
				timestamp: Date.now(),
			})

			return related_posts
		} catch (error) {
			console.warn('Related posts unavailable:', error)
			return []
		} finally {
			this.loading.delete(post_id)
		}
	}
}

const RELATED_POSTS_KEY = Symbol('related_posts')

export function set_related_posts_state() {
	const state = new RelatedPostsState()
	setContext(RELATED_POSTS_KEY, state)
	return state
}

export function get_related_posts_state(): RelatedPostsState {
	return getContext<RelatedPostsState>(RELATED_POSTS_KEY)
}

// Fallback function for server-side usage
export const get_related_posts_for_post = async (
	post_id: string,
): Promise<RelatedPost[]> => {
	try {
		const response = await fetch(
			`/api/related-posts?post_id=${post_id}`,
		)

		if (!response.ok) {
			return []
		}

		const data = await response.json()
		return data.related_posts || []
	} catch (error) {
		console.warn('Related posts unavailable:', error)
		return []
	}
}
