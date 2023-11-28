import { EXCHANGE_RATE_API_KEY } from '$env/static/private'
import { turso_client } from '$lib/turso'
import type { ResultSet } from '@libsql/client/http'
import { differenceInHours, parseISO } from 'date-fns'
import type { ExchangeRates, PricingNumbers } from './stores'

const fetch_exchange_rates = async (): Promise<ExchangeRates> => {
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
    console.error('Error checking last updated time:', error)
    fetch_new_rates = true
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
        console.error(`Error updating rate for ${currency}:`, error)
      }
    }

    return fetched_rates
  }

  // If the rates are not outdated, fetch them from the database
  try {
    const result = await client.execute(
      'SELECT currency_code, rate FROM exchange_rates;',
    )
    const rates: ExchangeRates = {}
    result.rows.forEach(row => {
      const currency_code = row['currency_code'] as string
      const rate = row['rate'] as number
      rates[currency_code] = rate
    })
    return rates
  } catch (error) {
    console.error('Error fetching rates from database:', error)
    throw new Error('Failed to fetch exchange rates')
  }
}

const fetch_pricing_numbers = async () => {
  const client = turso_client()
  let pricing_numbers: ResultSet

  try {
    pricing_numbers = await client.execute(
      'SELECT * FROM pricing_numbers ORDER BY last_updated DESC LIMIT 1;',
    )
    return pricing_numbers.rows[0] as unknown as PricingNumbers
  } catch (error) {
    console.error('Error fetching from Turso DB:', error)
  }
}

export const load = async () => {
  const exchange_rates_data = await fetch_exchange_rates()
  const pricing_numbers_data = await fetch_pricing_numbers()

  return {
    exchange_rates: exchange_rates_data,
    pricing_numbers: pricing_numbers_data,
  }
}
