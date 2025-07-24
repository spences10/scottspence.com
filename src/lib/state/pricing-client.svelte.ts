type ExchangeRates = {
	GBP: number
	USD: number
	CAD: number
}

type PricingNumbers = {
	posts_per_week: number
	years_programming: number
	total_posts: number
	average_reading_time: number
	annual_rate_eur?: number
	chosen_holidays?: number
	working_days_in_year?: number
	public_holidays?: number
}

interface PricingData {
	exchangeRates: ExchangeRates
	pricingNumbers: PricingNumbers
}

class PricingState {
	data = $state<PricingData>({
		exchangeRates: { GBP: 0.86, USD: 1.09, CAD: 1.47 },
		pricingNumbers: {
			posts_per_week: 1,
			years_programming: 10,
			total_posts: 100,
			average_reading_time: 5,
			annual_rate_eur: 120000,
			chosen_holidays: 25,
			working_days_in_year: 260,
			public_holidays: 8,
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
