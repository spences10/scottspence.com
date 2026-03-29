import {
	calculate_contractor_vs_permanent,
	type UkTaxConfig,
} from '$lib/uk-tax-calculator'
import { country_to_currency } from '../../routes/lets-work-together/utils'

type ExchangeRates = {
	EUR: number
	USD: number
	CAD: number
}

type PricingConfig = {
	day_rate_gbp: number
	ir35_uplift_pct: number
	working_days_in_year: number
	public_holidays: number
	default_pto_days: number
}

interface PricingData {
	exchange_rates: ExchangeRates
	pricing_config: PricingConfig
	uk_tax_config: UkTaxConfig
}

const DEFAULT_TAX_CONFIG: UkTaxConfig = {
	personal_allowance: 12570,
	personal_allowance_taper_start: 100000,
	basic_rate_ceiling: 50270,
	higher_rate_ceiling: 125140,
	basic_rate: 0.2,
	higher_rate: 0.4,
	additional_rate: 0.45,
	ni_primary_threshold: 12570,
	ni_upper_earnings_limit: 50270,
	ni_main_rate: 0.08,
	ni_upper_rate: 0.02,
	corporation_tax_rate: 0.25,
	dividend_allowance: 500,
	dividend_basic_rate: 0.0875,
	dividend_higher_rate: 0.3375,
	basic_rate_band: 37700,
}

class PricingState {
	data = $state<PricingData>({
		exchange_rates: { EUR: 1.17, USD: 1.27, CAD: 1.74 },
		pricing_config: {
			day_rate_gbp: 575,
			ir35_uplift_pct: 25,
			working_days_in_year: 252,
			public_holidays: 8,
			default_pto_days: 30,
		},
		uk_tax_config: { ...DEFAULT_TAX_CONFIG },
	})

	selected_currency = $state('USD')
	pto_days = $state(30)
	ir35_inside = $state(false)

	get is_gbp(): boolean {
		return this.selected_currency === 'GBP'
	}

	get currency_rate(): number {
		if (this.is_gbp) return 1
		return (
			this.data.exchange_rates[
				this.selected_currency as keyof ExchangeRates
			] ?? 1
		)
	}

	get day_rate(): number {
		const base = this.data.pricing_config.day_rate_gbp
		if (this.is_gbp && this.ir35_inside) {
			return (
				base * (1 + this.data.pricing_config.ir35_uplift_pct / 100)
			)
		}
		return base
	}

	get day_rate_in_currency(): number {
		return this.day_rate * this.currency_rate
	}

	get billable_days(): number {
		return (
			this.data.pricing_config.working_days_in_year -
			this.data.pricing_config.public_holidays -
			this.pto_days
		)
	}

	get annual_rate(): number {
		return this.day_rate * this.billable_days
	}

	get monthly_rate(): number {
		return this.annual_rate / 12
	}

	get weekly_rate(): number {
		return this.day_rate * 5
	}

	// Calculated from UK tax bands — contractor take-home vs equivalent salary
	get tax_comparison() {
		return calculate_contractor_vs_permanent(
			this.data.pricing_config.day_rate_gbp,
			this.data.pricing_config.working_days_in_year,
			this.data.uk_tax_config,
		)
	}

	get salary_equivalent(): number {
		return this.tax_comparison.equivalent_permanent.gross
	}

	get contractor_take_home(): number {
		return this.tax_comparison.contractor.take_home
	}

	init(server_data: PricingData, country: string | null) {
		this.data = server_data
		this.pto_days = server_data.pricing_config.default_pto_days
		this.selected_currency = country_to_currency(country)
	}
}

export const pricing_state = new PricingState()

export type { ExchangeRates, PricingConfig, PricingData }
