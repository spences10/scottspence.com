type ExchangeRates = {
	GBP: number
	USD: number
	CAD: number
}

type PricingNumbers = {
	annual_rate_eur: number
	chosen_holidays: number
	public_holidays: number
	working_days_in_year: number
}

interface PricingData {
	exchangeRates: ExchangeRates
	pricingNumbers: PricingNumbers
}

class PricingState {
	data = $state<PricingData>({
		exchangeRates: { GBP: 0.86, USD: 1.09, CAD: 1.47 },
		pricingNumbers: {
			annual_rate_eur: 155000,
			chosen_holidays: 30,
			public_holidays: 8,
			working_days_in_year: 252,
		},
	})

	// Initialize with server data
	init(serverData: PricingData) {
		this.data = serverData
	}
}

// Single universal instance shared everywhere
export const pricing_state = new PricingState()

// Export types
export type { ExchangeRates, PricingData, PricingNumbers }
