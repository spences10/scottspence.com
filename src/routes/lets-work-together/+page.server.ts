import { CURRENCY_API_KEY } from '$env/static/private'
import { exchange_rates_key, redis } from '$lib/redis'

export const load = async () => {
  const cached = await redis.get(exchange_rates_key())
  if (cached) {
    return { exchange_rates: cached }
  }

  const exchange_rates = await fetch(
    `https://api.freecurrencyapi.com/v1/latest?apikey=${CURRENCY_API_KEY}&currencies=GBP%2CUSD%2CCAD&base_currency=EUR`,
  )

  let { data } = await exchange_rates.json()

  await redis.set(exchange_rates_key(), JSON.stringify(data), {
    ex: 3600,
  })

  return { exchange_rates: data }
}
