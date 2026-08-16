import { get_reactions_leaderboard } from '#lib/state/reactions-leaderboard.svelte.js';

export const load = async () => {
	return await get_reactions_leaderboard();
};
