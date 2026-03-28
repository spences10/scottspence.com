import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ data }) => {
	const slug = 'lets-work-together'
	try {
		const Copy = await import(`../../../copy/${slug}.md`)
		return {
			...data,
			Copy: Copy.default,
		}
	} catch (e) {
		error(404, 'Uh oh!')
	}
}
