import { error } from '@sveltejs/kit'

export const load = async ({ data }) => {
	const slug = 'newsletter'
	try {
		const Copy = await import(`../../../copy/${slug}.md`)
		return {
			Copy: Copy.default,
			newsletter_subscriber_count: data.newsletter_subscriber_count,
		}
	} catch (e) {
		error(404, 'Uh oh!')
	}
}
