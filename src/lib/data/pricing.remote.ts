import { query } from '$app/server'
import { EXCHANGE_RATE_API_KEY } from '$env/static/private'
import { sqlite_client } from '$lib/sqlite/client'
import { differenceInHours, parseISO } from 'date-fns'

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

export const get_pricing_data = query(
	async (): Promise<PricingData> => {
		try {
			const [exchangeRates, pricingNumbers] = await Promise.all([
				fetch_exchange_rates(),
				fetch_pricing_numbers(),
			])

			return {
				exchangeRates,
				pricingNumbers,
			}
		} catch (error) {
			console.warn('Database unavailable for pricing data:', error)
			return {
				exchangeRates: { GBP: 0.86, USD: 1.09, CAD: 1.47 },
				pricingNumbers: {
					posts_per_week: 1,
					years_programming: 10,
					total_posts: 100,
					average_reading_time: 5,
				},
			}
		}
	},
)

async function fetch_exchange_rates(): Promise<ExchangeRates> {
	let fetch_new_rates = false

	// Check if the rates in the database are outdated
	try {
		const last_update_result = await sqlite_client.execute(
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
			'Database unavailable for checking rates update time:',
			error,
		)
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
				await sqlite_client.execute({
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
		const result = await sqlite_client.execute(
			'SELECT currency_code, rate FROM exchange_rates;',
		)
		const rates: ExchangeRates = { GBP: 0, USD: 0, CAD: 0 }
		result.rows.forEach((row) => {
			const code = row.currency_code as keyof ExchangeRates
			rates[code] = Number(row.rate)
		})
		return rates
	} catch (error) {
		console.warn('Database unavailable for exchange rates:', error)
		return { GBP: 0.86, USD: 1.09, CAD: 1.47 } // Fallback rates
	}
}

async function fetch_pricing_numbers(): Promise<PricingNumbers> {
	try {
		const pricing_numbers = await sqlite_client.execute(
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
		console.warn('Database unavailable for pricing numbers:', error)
		return {
			posts_per_week: 1,
			years_programming: 10,
			total_posts: 100,
			average_reading_time: 5,
		}
	}
}

// Export types
export type { ExchangeRates, PricingData, PricingNumbers }
