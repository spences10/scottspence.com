// Fetch data from the Fathom Analytics API and cache the results.

import { building } from '$app/environment'
import {
  current_visitors_key,
  page_views_key,
  popular_posts_key,
  redis,
} from './redis'

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
 * @param cache_key_prefix - The key prefix when generating the cache key.
 * @returns The data returned by the API.
 */
export const fetch_fathom_data = async (
  fetch: Fetch,
  endpoint: string,
  params: { [s: string]: unknown } | ArrayLike<unknown>,
  headers: Headers,
  cache_duration: number,
  cache_key_prefix: string,
  cache_key_period: string = '',
) => {
  if (DISABLE_FATHOM_API_FETCHING || building) return null

  const url = new URL(`https://api.usefathom.com/v1/${endpoint}`)
  Object.entries(params)
    .sort(([key_a], [key_b]) => key_a.localeCompare(key_b))
    .forEach(([key, value]) => {
      const decoded_value = decodeURIComponent(value as string)
      url.searchParams.append(key, decoded_value)
    })

  let cache_key
  switch (cache_key_prefix) {
    case 'current_visitors':
      cache_key = current_visitors_key()
      break
    case 'page_views':
      cache_key = page_views_key(
        cache_key_prefix,
        decodeURIComponent(url.search),
        params,
      )
      break
    case 'popular_posts':
      cache_key = popular_posts_key(
        cache_key_prefix,
        decodeURIComponent(url.search),
        params,
        cache_key_period,
      )
      break
    default:
      throw new Error(`Unknown cache_key_prefix: ${cache_key_prefix}`)
  }

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
