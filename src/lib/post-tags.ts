import { get_posts } from '$lib/posts'

interface PostsByTag {
	[tag: string]: Post[]
}

export const get_post_tags = async () => {
	const posts_by_tag: PostsByTag = {}

	const { posts } = await get_posts()

	posts.forEach((post: Post) => {
		if (post.tags && !post.isPrivate) {
			// Split the tags string into an array
			// @ts-ignore
			const split_tags = post.tags.split(',')

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
