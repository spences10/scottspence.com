import { EXCHANGE_RATE_API_KEY } from '$env/static/private'
import {
  cache_get,
  cache_set,
  exchange_rates_key,
  pricing_numbers_key,
  redis,
} from '$lib/redis'
import { time_to_seconds } from '$lib/utils'
import type { ExchangeRates } from './stores'

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
  await cache_set(key, JSON.stringify(fetched_data), cache_expiry)

  return fetched_data
}

const fetch_exchange_rates = async () => {
  const response = await fetch(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${EXCHANGE_RATE_API_KEY}&currencies=GBP%2CUSD%2CCAD&base_currency=EUR`,
  )
  return (await response.json()).data
}

const fetch_pricing_numbers = async (): Promise<{
  [key: string]: number
}> => {
  const all_fields = await redis.hgetall(pricing_numbers_key())

  if (all_fields === null) {
    throw new Error('Could not fetch pricing numbers from Redis')
  }

  const pricing_numbers_data: { [key: string]: number } = {}

  for (const [key, value] of Object.entries(all_fields)) {
    pricing_numbers_data[key] = Number(value)
  }

  return pricing_numbers_data
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
