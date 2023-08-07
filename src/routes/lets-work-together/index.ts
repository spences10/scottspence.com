import { writable } from 'svelte/store'

export { default as BlogPost } from './blog-post.svelte'
export { default as Rate } from './rate.svelte'
export { default as Video } from './video.svelte'
export { default as Workshop } from './workshop.svelte'

export const locale_string = (number: number) =>
  number.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })

export type ExchangeRates = {
  [key: string]: number
}
export const exchange_rates_store = writable<ExchangeRates>({})

export type PricingNumber = {
  id?: string
  createdTime?: string
  fields: {
    value?: number | undefined
    description?: string
    'constant-name'?: string
  }
}

export const pricing_numbers_store = writable<PricingNumber[]>([])

export const get_field_value = (
  constant_name: string,
): number | undefined => {
  let result
  pricing_numbers_store.subscribe(value => {
    const found = value.find(
      item => item.fields['constant-name'] === constant_name,
    )
    if (found) {
      result = found.fields.value
    }
  })()
  return result
}
