import { get_pricing_data } from '#lib/state/pricing.svelte.js';
import type { ServerLoadEvent } from '@sveltejs/kit';

export const load = async ({ locals }: ServerLoadEvent) => {
	const { exchange_rates, pricing_config, uk_tax_config } =
		await get_pricing_data();

	return {
		exchange_rates,
		pricing_config,
		uk_tax_config,
		country: locals.country,
	};
};
