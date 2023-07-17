// Fetch data from the Fathom Analytics API and cache the results.

import { building } from '$app/environment'
import crypto from 'crypto'
import { current_visitors_key, redis } from './redis'

// Disable calls to the Fathom Analytics API.
const DISABLE_FATHOM_API_FETCHING = false

/**
 * Fetches data from the Fathom Analytics API.
 *
 * @param fetch - The `fetch` function to use for making HTTP requests.
 * @param endpoint - The API endpoint to fetch data from `aggregations ` or `current_visitors`.
 * @param params - An object containing query parameters to include in the API request.
 * @param headers - An object containing headers to include in the API request.
 * @param cache_duration - The number of seconds to cache the API response for.
 * @param base_slug - The base slug to use when generating the cache key.
 * @returns The data returned by the API.
 */
export const fetch_fathom_data = async (
  fetch: Fetch,
  endpoint: string,
  params: { [s: string]: unknown } | ArrayLike<unknown>,
  headers: Headers,
  cache_duration: number,
  base_slug: string,
) => {
  if (DISABLE_FATHOM_API_FETCHING || building) return null

  const url = new URL(`https://api.usefathom.com/v1/${endpoint}`)
  Object.entries(params)
    .sort(([key_a], [key_b]) => key_a.localeCompare(key_b))
    .forEach(([key, value]) => {
      const decoded_value = decodeURIComponent(value as string)
      url.searchParams.append(key, decoded_value)
    })

  const cache_key = endpoint.includes('current_visitors')
    ? current_visitors_key()
    : generate_cache_key(
        base_slug,
        decodeURIComponent(url.search),
        params,
      )

  const cached = await get_data_from_cache(cache_key)
  if (cached) return cached

  const res = await fetch(url.toString(), { headers })

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()

  if (Object.keys(data).length === 0) {
    return data
  }

  await cache_response(cache_key, data, cache_duration)

  return data
}

/**
 * Retrieves data from the Redis cache.
 *
 * @param cache_key - The cache key to retrieve data for.
 * @returns The cached data, or null if the data is not in the cache.
 */
export const get_data_from_cache = async (cache_key: string) => {
  try {
    const cached = await redis.get(cache_key)
    if (cached) return cached
  } catch (e) {
    console.error(`Error fetching data from cache: ${e}`)
  }
  return null
}

/**
 * Caches a response in Redis.
 *
 * @param cache_key - The cache key to use for storing the response.
 * @param data - The data to cache.
 * @param cache_duration - The number of seconds to cache the data for.
 */
export const cache_response = async (
  cache_key: string,
  data: any,
  cache_duration: number,
) => {
  try {
    await redis.setex(cache_key, cache_duration, JSON.stringify(data))
  } catch (e) {
    console.error(`Error caching response: ${e}`)
  }
}

/**
 * Generates a cache key for a given set of parameters.
 * `page_views` or `current_visitors` used for `base_slug`
 * for human readable cache key.
 *
 * @param base_slug - The base slug to use when generating the cache key.
 * @param url - The URL to include in the cache key.
 * @param params - An object containing query parameters to include in the cache key.
 * @returns The generated cache key.
 */
function generate_cache_key(
  base_slug: string,
  url: string,
  params: any,
): string {
  const hash = crypto.createHash('sha256')
  hash.update(url)
  const short_hash = hash.digest('hex').substring(0, 8)

  // Parse the filters property
  const filters = JSON.parse(params.filters || '[]')
  const pathname = filters.length > 0 ? filters[0].value : ''
  const grouping = params.date_grouping || ''

  // Extract the slug from the pathname
  const slug = pathname.split('/').pop() || ''

  // Include the slug and additional information in the cache key
  return `${base_slug}:${slug}:${grouping}:${short_hash}`
}
