import { get_pricing_data } from '$lib/state/pricing.svelte'

export const load = async () => {
	const { exchangeRates, pricingNumbers } = await get_pricing_data()

	return {
		exchange_rates: exchangeRates,
		pricing_numbers: pricingNumbers,
	}
}
