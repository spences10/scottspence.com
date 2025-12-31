import { env } from '$env/dynamic/private'
import { website } from '$lib/info'
import { get_post_tags } from '$lib/post-tags'
import { get_posts } from '$lib/posts'
import { error } from '@sveltejs/kit'
import slugify from 'slugify'

async function generate_url_list() {
	const { posts: posts_metadata } = await get_posts()
	const { tags } = await get_post_tags()

	const pages = [
		{ page: `about`, updated: `2022-08-22` },
		{ page: `contact`, updated: `2022-03-01` },
		{ page: `faq`, updated: `2022-08-22` },
		{ page: `newsletter`, updated: `2022-08-22` },
		{ page: `now`, updated: `2022-08-22` },
		{ page: `portfolio`, updated: `2022-08-22` },
		{ page: `privacy-policy`, updated: `2023-06-29` },
		{ page: `cookie-policy`, updated: `2023-06-29` },
		{ page: `speaking`, updated: `2023-01-17` },
		{ page: `uses`, updated: `2022-08-22` },
		{ page: `tags`, updated: `2023-04-22` },
		{ page: `media`, updated: `2022-03-13` },
	]

	const urls: string[] = [
		website,
		...posts_metadata
			.filter(({ is_private }) => !is_private)
			.map(({ slug }) => `${website}/posts/${slug}`),
		...pages.map(({ page }) => `${website}/${page}`),
		...tags.map((tag) => `${website}/tags/${slugify(tag)}`),
	]

	return urls
}

export const index_now = async (fetch: Function) => {
	const api_key = env.INDEXNOW_API_KEY
	const host = new URL(website).hostname

	if (!api_key) {
		return error(
			500,
			'INDEXNOW_API_KEY is not set in environment variables',
		)
	}

	const urls = await generate_url_list()

	const response = await fetch('https://api.indexnow.org/IndexNow', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			host: host,
			key: api_key,
			keyLocation: `https://${host}/${api_key}.txt`,
			urlList: urls,
		}),
	})

	if (response.ok) {
		return {
			message: 'URLs submitted successfully to IndexNow',
			urls,
		}
	} else {
		const error_text = await response.text()
		return error(500, `Failed to submit URLs: ${error_text}`)
	}
}
