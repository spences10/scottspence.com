import { query } from '$app/server'
import { get_posts } from '$lib/data/posts.remote'
import {
	group_posts_by_tag,
	type PostTagsResult,
} from '$lib/utils/group-posts-by-tag'

export type { PostTagsResult }

export const get_post_tags = query(
	async (): Promise<PostTagsResult> => {
		const posts = await get_posts()
		return group_posts_by_tag(posts)
	},
)
