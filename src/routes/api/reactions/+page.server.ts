import { submit_reaction } from '$lib/state/reactions.svelte'
import { fail } from '@sveltejs/kit'

export const actions = {
	default: async ({ request, url, getClientAddress }) => {
		const ip = getClientAddress()
		const data = await request.formData()
		const reaction = data.get('reaction')
		const path = url.searchParams.get('path')

		if (typeof reaction !== 'string' || typeof path !== 'string') {
			return fail(400, { error: 'Invalid reaction or path' })
		}

		return await submit_reaction(reaction, path, ip)
	},
}
