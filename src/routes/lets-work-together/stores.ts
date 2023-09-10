import { writable } from 'svelte/store'

export type ExchangeRates = {
  [key: string]: number
}

export const exchange_rates_store = writable<ExchangeRates>({})

export type PricingNumbers = { [key: string]: number }

export const pricing_numbers_store = writable<PricingNumbers>({})

export const get_field_value = (
  constant_name: string,
): number | undefined => {
  let result
  pricing_numbers_store.subscribe(value => {
    result = value[constant_name]
  })()
  return result
}
