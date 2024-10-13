import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { slug } = params
	const response = await fetch(
		`../../api/fetch-post-analytics?slug=${slug}`,
	)

	if (!response.ok) {
		console.error('Failed to fetch analytics:', response.statusText)
		return { analytics: null }
	}

	const analytics = await response.json()
	return { analytics }
}
