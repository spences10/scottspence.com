import { building } from '$app/environment'
import { FATHOM_API_KEY } from '$env/static/private'
import { cache_set } from '$lib/redis'
import { get_cache_key } from './get-cache-key'
import { get_data_from_cache } from './get-data-from-cache'

// Disable calls to the Fathom Analytics API.
const DISABLE_FATHOM_API_FETCHING = false

/**
 * Fetches data from the Fathom Analytics API.
 *
 * @param fetch - The `fetch` function to use for making HTTP requests.
 * @param endpoint - The API endpoint to fetch data from `aggregations ` or `current_visitors`.
 * @param params - An object containing query parameters to include in the API request.
 * @param cache_duration - The number of seconds to cache the API response for.
 * @param cache_key_prefix - The key prefix when generating the cache key.
 * @param block_fathom - Cookie value to block Fathom.
 * @returns The data returned by the API.
 */
export const fetch_fathom_data = async (
  fetch: Fetch,
  endpoint: string,
  params: Record<string, unknown>,
  cache_duration: number,
  cache_key_prefix: string,
  block_fathom: boolean,
) => {
  const cache_key = get_cache_key(cache_key_prefix, params)

  const cached = await get_data_from_cache(cache_key)
  if (cached) return cached

  if (DISABLE_FATHOM_API_FETCHING || building || block_fathom) {
    console.log('=====================')
    console.log(
      `Blocking Fathom, no API call! block_fathom: ${block_fathom}`,
    )
    console.log('=====================')
    return null
  }

  const url = new URL(`https://api.usefathom.com/v1/${endpoint}`)
  Object.entries(params)
    .sort(([key_a], [key_b]) => key_a.localeCompare(key_b))
    .forEach(([key, value]) => {
      const decoded_value = decodeURIComponent(value as string)
      url.searchParams.append(key, decoded_value)
    })

  const headers = new Headers()
  headers.append('Authorization', `Bearer ${FATHOM_API_KEY}`)

  const res = await fetch(url.toString(), { headers })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()

  if (Object.keys(data).length === 0) {
    return data
  }

  await cache_set(cache_key, data, cache_duration)

  return data
}
