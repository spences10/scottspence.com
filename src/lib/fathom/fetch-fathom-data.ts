import { building } from '$app/environment'
import { FATHOM_API_KEY } from '$env/static/private'
import { cache_get, cache_set } from '$lib/redis'
import { get_cache_key } from './get-cache-key'

type FathomDataResponse =
  | VisitorData
  | AnalyticsData
  | Post
  | PopularPosts
  | null
  | []

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
 * @returns {Promise<FathomDataResponse>} The data returned by the API.
 */
export const fetch_fathom_data = async (
  fetch: Fetch,
  endpoint: string,
  params: Record<string, unknown>,
  cache_duration: number,
  cache_key_prefix: string,
  block_fathom: boolean,
): Promise<FathomDataResponse> => {
  try {
    const cache_key = get_cache_key(cache_key_prefix, params)

    const cached = await cache_get(cache_key)
    if (cached) {
      console.log('=====================')
      console.log(`Cache hit for ${cache_key}`)
      console.log('=====================')
      return cached
    } else {
      console.log('=====================')
      console.log(`Cache miss for ${cache_key}`)
      console.log('=====================')
    }

    if (DISABLE_FATHOM_API_FETCHING || building || block_fathom) {
      console.log('=====================')
      console.log(
        `Blocking Fathom, no API call! block_fathom: ${block_fathom}`,
      )
      console.log('=====================')
      return get_empty_data_shape(cache_key_prefix)
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
      // Log the error for internal tracking
      console.error(`HTTP error ${res.status}: ${res.statusText}`)
      return null // Silently fail for the user
    }

    const content_type = res.headers.get('content-type')
    if (!content_type || !content_type.includes('application/json')) {
      // Log the error for internal tracking
      console.error('Invalid content type: Expected application/json')
      return null // Silently fail for the user
    }

    const data = await res.json()

    if (Object.keys(data).length === 0) {
      return []
    }

    await cache_set(cache_key, data, cache_duration)

    return data
  } catch (error) {
    // Log the error for internal tracking
    // @ts-ignore
    console.error(`Error fetching Fathom data: ${error.message}`)
    return get_empty_data_shape(cache_key_prefix)
  }
}

const get_empty_data_shape = (
  cache_key_prefix: string,
): FathomDataResponse => {
  switch (cache_key_prefix) {
    case 'current_visitors':
      return { content: [], referrers: [], total: 0 }
    case 'page_views_day':
    case 'page_views_month':
    case 'page_views_year':
      return []
    case 'popular_posts_day':
    case 'popular_posts_month':
    case 'popular_posts_year':
      return []
    default:
      return null
  }
}
