import {
  EXCHANGE_RATE_API_KEY,
  PRICING_API_KEY,
  PRICING_BASE_ID,
} from '$env/static/private'
import {
  exchange_rates_key,
  pricing_numbers_key,
  redis,
} from '$lib/redis'
import { time_to_seconds } from '$lib/utils'
import type { ExchangeRates, PricingNumber } from '.'

const get_cached_or_fetch = async <T>(
  key: string,
  fetch_callback: () => Promise<T>,
  cache_expiry: number,
): Promise<T> => {
  let cached_data: T | null = await redis.get(key)

  if (cached_data) {
    return cached_data
  }

  const fetched_data: T = await fetch_callback()
  await redis.set(key, JSON.stringify(fetched_data), {
    ex: cache_expiry,
  })

  return fetched_data
}

const fetch_exchange_rates = async () => {
  const response = await fetch(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${EXCHANGE_RATE_API_KEY}&currencies=GBP%2CUSD%2CCAD&base_currency=EUR`,
  )
  return (await response.json()).data
}

const fetch_pricing_numbers = async () => {
  const response = await fetch(
    `https://api.airtable.com/v0/${PRICING_BASE_ID}/pricing-table`,
    {
      headers: {
        Authorization: `Bearer ${PRICING_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  )
  return (await response.json()).records
}

export const load = async () => {
  const [exchange_rates_data, pricing_numbers_data] =
    await Promise.all([
      get_cached_or_fetch<ExchangeRates>(
        exchange_rates_key(),
        fetch_exchange_rates,
        time_to_seconds({ hours: 48 }),
      ),
      get_cached_or_fetch<PricingNumber[]>(
        pricing_numbers_key(),
        fetch_pricing_numbers,
        time_to_seconds({ minutes: 5 }),
      ),
    ])

  return {
    exchange_rates: exchange_rates_data,
    pricing_numbers: pricing_numbers_data,
  }
}
