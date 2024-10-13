import { get_reaction_count_data } from '$lib/utils/get-reaction-count'

export const load = async ({ url }) => {
	const count = await get_reaction_count_data(url.pathname)

	return {
		count,
	}
}
