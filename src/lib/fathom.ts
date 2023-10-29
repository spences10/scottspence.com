// Fetch data from the Fathom Analytics API and cache the results.

import { building } from '$app/environment'
import { FATHOM_API_KEY } from '$env/static/private'
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
    await redis.set(cache_key, JSON.stringify(data), {
      ex: cache_duration,
    })
  } catch (e) {
    console.error(`Error caching response: ${e}`)
  }
}

const get_cache_key = (
  prefix: string,
  params: Record<string, unknown>,
) => {
  switch (prefix) {
    case 'current_visitors':
      return current_visitors_key()
    case 'page_views_day':
    case 'page_views_month':
    case 'page_views_year':
      return page_views_key(prefix, params)
    case 'popular_posts_day':
    case 'popular_posts_month':
    case 'popular_posts_year':
      return popular_posts_key(prefix)
    default:
      throw new Error(`Unknown cache_key_prefix: ${prefix}`)
  }
}

/**
 * Handles the block fathom scenario.
 *
 * @param data - The cached data.
 * @param data_key - The key for the response body.
 *
 * @returns {Object|null} - Returns an object containing the response
 * body and headers if the Fathom script is blocked, or null.
 */
export const handle_block_fathom = (data: any, data_key: string) => {
  console.log('=====================')
  console.log(
    `Handle Block Fathom: ${
      data_key.charAt(0).toUpperCase() + data_key.slice(1)
    }`,
  )
  console.log('=====================')

  if (
    (Array.isArray(data) && data.length > 0) ||
    (data && data.total != null && data.content)
  ) {
    // Cached data is available, return it
    console.log('=====================')
    console.log(
      `Handle Block Fathom Cache Hit: ${
        data_key.charAt(0).toUpperCase() + data_key.slice(1)
      }`,
    )
    console.log('=====================')
    return {
      body: {
        [data_key]: data,
      },
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  } else {
    // No cached data available, return empty array
    console.log('=====================')
    console.log(
      `Handle Block Fathom Cache Miss: ${
        data_key.charAt(0).toUpperCase() + data_key.slice(1)
      }`,
    )
    console.log('=====================')
    return {
      body: {
        [data_key]: Array.isArray(data) ? [] : {},
        message: 'Fathom script is blocked on the client-side.',
      },
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
      },
    }
  }
}
