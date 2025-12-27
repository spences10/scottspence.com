import { error } from '@sveltejs/kit'

export const load = async () => {
	const slug = 'my-todo-list'
	try {
		const Copy = await import(`../../../copy/${slug}.md`)
		return {
			Copy: Copy.default,
		}
	} catch (e) {
		error(404, 'Uh oh!')
	}
}
