import { error } from '@sveltejs/kit'

export const load = async ({ params }) => {
	const { slug } = params

	try {
		const newsletter = await import(
			`../../../../newsletter/${slug}.md`
		)
		return {
			Content: newsletter.default,
			meta: { ...newsletter.metadata, slug },
		}
	} catch (err) {
		error(404, {
			message: 'Newsletter not found',
		})
	}
}
