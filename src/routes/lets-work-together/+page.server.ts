import { EXCHANGE_RATE_API_KEY } from '$env/static/private'
import { cache_get, cache_set, exchange_rates_key } from '$lib/redis'
import { turso_client } from '$lib/turso'
import { time_to_seconds } from '$lib/utils'
import type { ResultSet } from '@libsql/client/http'
import type { ExchangeRates, PricingNumbers } from './stores'

const get_cached_or_fetch = async <T>(
  key: string,
  fetch_callback: () => Promise<T>,
  cache_expiry: number,
): Promise<T> => {
  let cached_data: T | null = await cache_get(key)

  if (cached_data) {
    return cached_data
  }

  const fetched_data: T = await fetch_callback()
  await cache_set(key, fetched_data, cache_expiry)

  return fetched_data
}

const fetch_exchange_rates = async () => {
  const response = await fetch(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${EXCHANGE_RATE_API_KEY}&currencies=GBP%2CUSD%2CCAD&base_currency=EUR`,
  )
  return (await response.json()).data
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
  const exchange_rates_data =
    await get_cached_or_fetch<ExchangeRates>(
      exchange_rates_key(),
      fetch_exchange_rates,
      time_to_seconds({ minutes: 5 }),
    )

  const pricing_numbers_data = await fetch_pricing_numbers()

  return {
    exchange_rates: exchange_rates_data,
    pricing_numbers: pricing_numbers_data,
  }
}
