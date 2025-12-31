import { error } from '@sveltejs/kit'

export const load = async () => {
	const slugs = ['bio-corporate', 'bio-fun']
	try {
		const [corporateCopy, funCopy] = await Promise.all(
			slugs.map((slug) => import(`../../../copy/${slug}.md`)),
		)
		return {
			CorporateCopy: corporateCopy.default,
			FunCopy: funCopy.default,
		}
	} catch (e) {
		error(404, 'Uh oh!')
	}
}
