import { EXCHANGE_RATE_API_KEY } from '$env/static/private'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { sqlite_client } from '$lib/sqlite/client'
import {
	DEFAULT_TAX_CONFIG,
	type UkTaxConfig,
} from '$lib/uk-tax-calculator'
import { differenceInHours, parseISO } from 'date-fns'

const CACHE_KEY = 'pricing_v3'

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

const DEFAULT_CONFIG: PricingConfig = {
	day_rate_gbp: 575,
	ir35_uplift_pct: 25,
	working_days_in_year: 252,
	public_holidays: 8,
	default_pto_days: 30,
}

const FALLBACK_RATES: ExchangeRates = {
	EUR: 1.17,
	USD: 1.27,
	CAD: 1.74,
}

class PricingState {
	data = $state<PricingData>({
		exchange_rates: { ...FALLBACK_RATES },
		pricing_config: { ...DEFAULT_CONFIG },
		uk_tax_config: { ...DEFAULT_TAX_CONFIG },
	})
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	async load_pricing_data(): Promise<void> {
		if (BYPASS_DB_READS.pricing) {
			this.data = {
				exchange_rates: { ...FALLBACK_RATES },
				pricing_config: { ...DEFAULT_CONFIG },
				uk_tax_config: { ...DEFAULT_TAX_CONFIG },
			}
			return
		}

		const server_cached = get_from_cache<PricingData>(
			CACHE_KEY,
			CACHE_DURATIONS.pricing,
		)
		if (server_cached) {
			this.data = server_cached
			this.last_fetched = Date.now()
			return
		}

		if (
			Date.now() - this.last_fetched < CACHE_DURATIONS.pricing &&
			this.data.exchange_rates.USD > 0 &&
			this.data.pricing_config.day_rate_gbp > 0
		) {
			return
		}

		if (this.loading) return

		this.loading = true

		try {
			const [exchange_rates, pricing_config, uk_tax_config] =
				await Promise.all([
					this.fetch_exchange_rates(),
					this.fetch_pricing_config(),
					this.fetch_uk_tax_config(),
				])

			const data = { exchange_rates, pricing_config, uk_tax_config }

			this.data = data
			this.last_fetched = Date.now()
			set_cache(CACHE_KEY, data)
		} catch (error) {
			console.warn(
				'Database unavailable, keeping cached pricing data:',
				error instanceof Error ? error.message : 'Unknown error',
			)
		} finally {
			this.loading = false
		}
	}

	private async fetch_exchange_rates(): Promise<ExchangeRates> {
		const client = sqlite_client
		let fetch_new_rates = false

		try {
			const last_update_result = await client.execute(
				'SELECT MAX(last_updated) as last_update FROM exchange_rates;',
			)
			const last_updated = last_update_result.rows[0] as unknown as {
				last_update: string | null
			}

			if (
				!last_updated?.last_update ||
				differenceInHours(
					new Date(),
					parseISO(last_updated.last_update),
				) > 1
			) {
				fetch_new_rates = true
			}
		} catch (error) {
			console.warn(
				'Database unavailable for checking rates update time, will use fallbacks:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return { ...FALLBACK_RATES }
		}

		if (fetch_new_rates) {
			try {
				const response = await fetch(
					`https://api.freecurrencyapi.com/v1/latest?apikey=${EXCHANGE_RATE_API_KEY}&currencies=EUR%2CUSD%2CCAD&base_currency=GBP`,
				)
				const fetched_rates = (await response.json())
					.data as ExchangeRates

				for (const [currency, rate] of Object.entries(
					fetched_rates,
				)) {
					try {
						const stmt = client.prepare(
							`INSERT INTO exchange_rates (currency_code, rate) VALUES (?, ?)
							ON CONFLICT (currency_code) DO UPDATE SET rate = ?, last_updated = CURRENT_TIMESTAMP;`,
						)
						stmt.run(currency, rate, rate)
					} catch (error) {
						console.error(
							`Error updating exchange rate for ${currency}:`,
							error,
						)
					}
				}
			} catch (error) {
				console.warn(
					'Failed to fetch exchange rates from API:',
					error instanceof Error ? error.message : 'Unknown error',
				)
			}
		}

		try {
			const result = await client.execute(
				'SELECT currency_code, rate FROM exchange_rates;',
			)
			const rates: ExchangeRates = { ...FALLBACK_RATES }
			result.rows.forEach((row) => {
				const code = row.currency_code as keyof ExchangeRates
				if (code in rates) {
					rates[code] = Number(row.rate)
				}
			})
			return rates
		} catch (error) {
			console.warn(
				'Database unavailable for exchange rates, using fallbacks:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return { ...FALLBACK_RATES }
		}
	}

	private async fetch_pricing_config(): Promise<PricingConfig> {
		const client = sqlite_client

		try {
			const result = await client.execute(
				'SELECT * FROM pricing_config ORDER BY last_updated DESC LIMIT 1;',
			)

			if (result.rows.length === 0) {
				return { ...DEFAULT_CONFIG }
			}

			const row = result.rows[0]
			return {
				day_rate_gbp: Number(row.day_rate_gbp),
				ir35_uplift_pct: Number(row.ir35_uplift_pct),
				working_days_in_year: Number(row.working_days_in_year),
				public_holidays: Number(row.public_holidays),
				default_pto_days: Number(row.default_pto_days),
			}
		} catch (error) {
			console.warn(
				'Database unavailable for pricing config, using defaults:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return { ...DEFAULT_CONFIG }
		}
	}

	private async fetch_uk_tax_config(): Promise<UkTaxConfig> {
		const client = sqlite_client

		try {
			const result = await client.execute(
				'SELECT * FROM uk_tax_config ORDER BY last_updated DESC LIMIT 1;',
			)

			if (result.rows.length === 0) {
				return { ...DEFAULT_TAX_CONFIG }
			}

			const row = result.rows[0]
			return {
				personal_allowance: Number(row.personal_allowance),
				personal_allowance_taper_start: Number(
					row.personal_allowance_taper_start,
				),
				basic_rate_ceiling: Number(row.basic_rate_ceiling),
				higher_rate_ceiling: Number(row.higher_rate_ceiling),
				basic_rate: Number(row.basic_rate),
				higher_rate: Number(row.higher_rate),
				additional_rate: Number(row.additional_rate),
				ni_primary_threshold: Number(row.ni_primary_threshold),
				ni_upper_earnings_limit: Number(row.ni_upper_earnings_limit),
				ni_main_rate: Number(row.ni_main_rate),
				ni_upper_rate: Number(row.ni_upper_rate),
				corporation_tax_rate: Number(row.corporation_tax_rate),
				dividend_allowance: Number(row.dividend_allowance),
				dividend_basic_rate: Number(row.dividend_basic_rate),
				dividend_higher_rate: Number(row.dividend_higher_rate),
				basic_rate_band: Number(row.basic_rate_band),
			}
		} catch (error) {
			console.warn(
				'Database unavailable for UK tax config, using defaults:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return { ...DEFAULT_TAX_CONFIG }
		}
	}
}

const pricing_state = new PricingState()

export const get_pricing_data = async (): Promise<PricingData> => {
	await pricing_state.load_pricing_data()
	return pricing_state.data
}

