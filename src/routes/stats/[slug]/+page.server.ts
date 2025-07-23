import { get_post_analytics_for_slug } from '$lib/state/post-analytics.svelte'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params

	try {
		const analytics = await get_post_analytics_for_slug(slug)
		return { analytics }
	} catch (error) {
		console.error('Failed to fetch analytics:', error)
		return { analytics: null }
	}
}
