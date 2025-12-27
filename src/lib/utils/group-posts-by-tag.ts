interface PostsByTag {
	[tag: string]: Post[]
}

export interface PostTagsResult {
	tags: string[]
	posts_by_tag: PostsByTag
}

/**
 * Groups posts by their tags, filtering out private posts
 * and posts without tags
 */
export const group_posts_by_tag = (posts: Post[]): PostTagsResult => {
	const posts_by_tag: PostsByTag = {}

	posts.forEach((post: Post) => {
		if (post.tags && !post.is_private) {
			// Handle tags as either string or array
			const split_tags: string[] = Array.isArray(post.tags)
				? post.tags
				: (post.tags as string).split(',')

			split_tags.forEach((tag: string) => {
				if (!posts_by_tag[tag]) {
					posts_by_tag[tag] = []
				}
				posts_by_tag[tag].push(post)
			})
		}
	})

	const tags = Object.keys(posts_by_tag).sort()

	return {
		tags,
		posts_by_tag,
	}
}
