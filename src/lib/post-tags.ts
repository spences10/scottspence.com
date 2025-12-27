import { get_posts } from '$lib/posts'

interface PostsByTag {
	[tag: string]: Post[]
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

export const get_post_tags = async () => {
	const posts_by_tag: PostsByTag = {}

	const { posts } = await get_posts()

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

	return {
		tags,
		posts_by_tag,
	}
}
