import { EXCHANGE_RATE_API_KEY } from '$env/static/private'
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '$lib/cache/server-cache'
import { turso_client } from '$lib/turso'
import type { ResultSet } from '@libsql/client'
import { differenceInHours, parseISO } from 'date-fns'

const CACHE_KEY = 'pricing'

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
}

interface PricingData {
	exchangeRates: ExchangeRates
	pricingNumbers: PricingNumbers
}

class PricingState {
	data = $state<PricingData>({
		exchangeRates: { GBP: 0, USD: 0, CAD: 0 },
		pricingNumbers: {
			posts_per_week: 0,
			years_programming: 0,
			total_posts: 0,
			average_reading_time: 0,
		},
	})
	loading = $state<boolean>(false)
	last_fetched = $state<number>(0)

	async load_pricing_data(): Promise<void> {
		if (BYPASS_DB_READS.pricing) {
			this.data = {
				exchangeRates: { GBP: 0.86, USD: 1.09, CAD: 1.47 },
				pricingNumbers: {
					posts_per_week: 1,
					years_programming: 10,
					total_posts: 100,
					average_reading_time: 5,
				},
			}
			return // DB reads disabled
		}

		// Check server cache first
		const server_cached = get_from_cache<PricingData>(
			CACHE_KEY,
			CACHE_DURATIONS.pricing,
		)
		if (server_cached) {
			this.data = server_cached
			this.last_fetched = Date.now()
			return
		}

		// Check client cache
		if (
			Date.now() - this.last_fetched < CACHE_DURATIONS.pricing &&
			this.data.exchangeRates.USD > 0 &&
			this.data.pricingNumbers.total_posts > 0
		) {
			return // Use cached data
		}

		if (this.loading) return // Prevent concurrent requests

		this.loading = true

		try {
			const [exchangeRates, pricingNumbers] = await Promise.all([
				this.fetch_exchange_rates(),
				this.fetch_pricing_numbers(),
			])

			const data = {
				exchangeRates,
				pricingNumbers,
			}

			// Update both caches
			this.data = data
			this.last_fetched = Date.now()
			set_cache(CACHE_KEY, data)
		} catch (error) {
			console.warn(
				'Database unavailable, keeping cached pricing data:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			// Keep existing data on error - don't clear it
		} finally {
			this.loading = false
		}
	}

	private async fetch_exchange_rates(): Promise<ExchangeRates> {
		const client = turso_client()
		let fetch_new_rates = false

		// Check if the rates in the database are outdated
		try {
			const last_update_result = await client.execute(
				'SELECT MAX(last_updated) as last_update FROM exchange_rates;',
			)
			const last_updated = last_update_result.rows[0] as unknown as {
				last_update: string
			}

			if (
				last_updated &&
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
			// When database is unavailable, skip fetching new rates and use fallbacks
			return { GBP: 0.86, USD: 1.09, CAD: 1.47 }
		}

		// Fetch new rates if necessary and update the database
		if (fetch_new_rates) {
			const response = await fetch(
				`https://api.freecurrencyapi.com/v1/latest?apikey=${EXCHANGE_RATE_API_KEY}&currencies=GBP%2CUSD%2CCAD&base_currency=EUR`,
			)
			const fetched_rates = (await response.json())
				.data as ExchangeRates

			for (const [currency, rate] of Object.entries(fetched_rates)) {
				try {
					// TODO: Maybe keep a history of these?
					await client.execute({
						sql: `INSERT INTO exchange_rates (currency_code, rate) VALUES (?, ?)
							ON CONFLICT (currency_code) DO UPDATE SET rate = ?, last_updated = CURRENT_TIMESTAMP;`,
						args: [currency, rate, rate],
					})
				} catch (error) {
					console.error(
						`Error updating exchange rate for ${currency}:`,
						error,
					)
				}
			}
		}

		// If the rates are not outdated, fetch them from the database
		try {
			const result = await client.execute(
				'SELECT currency_code, rate FROM exchange_rates;',
			)
			const rates: ExchangeRates = { GBP: 0, USD: 0, CAD: 0 }
			result.rows.forEach((row) => {
				const code = row.currency_code as keyof ExchangeRates
				rates[code] = Number(row.rate)
			})
			return rates
		} catch (error) {
			console.warn(
				'Database unavailable for exchange rates, using fallbacks:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return { GBP: 0.86, USD: 1.09, CAD: 1.47 } // Fallback rates
		}
	}

	private async fetch_pricing_numbers(): Promise<PricingNumbers> {
		const client = turso_client()
		let pricing_numbers: ResultSet

		try {
			pricing_numbers = await client.execute(
				'SELECT * FROM pricing_numbers ORDER BY last_updated DESC LIMIT 1;',
			)

			if (pricing_numbers.rows.length === 0) {
				return {
					posts_per_week: 1,
					years_programming: 10,
					total_posts: 100,
					average_reading_time: 5,
				}
			}

			const row = pricing_numbers.rows[0]
			return {
				posts_per_week: Number(row.posts_per_week),
				years_programming: Number(row.years_programming),
				total_posts: Number(row.total_posts),
				average_reading_time: Number(row.average_reading_time),
			}
		} catch (error) {
			console.warn(
				'Database unavailable for pricing numbers, using defaults:',
				error instanceof Error ? error.message : 'Unknown error',
			)
			return {
				posts_per_week: 1,
				years_programming: 10,
				total_posts: 100,
				average_reading_time: 5,
			}
		}
	}
}

// Single universal instance shared everywhere
export const pricing_state = new PricingState()

// Server-side function that uses the pricing state instance
export const get_pricing_data = async (): Promise<PricingData> => {
	await pricing_state.load_pricing_data()
	return pricing_state.data
}

// Export types
export type { ExchangeRates, PricingData, PricingNumbers }
