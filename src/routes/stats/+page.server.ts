import { get_site_stats } from '#lib/state/site-stats.svelte.js';

export const load = async () => {
	return await get_site_stats();
};
