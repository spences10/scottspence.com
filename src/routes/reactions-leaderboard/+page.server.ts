import { get_reactions_leaderboard } from '$lib/state/reactions-leaderboard.svelte'

export const load = async () => {
	return await get_reactions_leaderboard()
}
