import { redis } from './client'

/**
 * Retrieves a cached response from Redis.
 *
 * @param cache_key - The cache key to use for retrieving the response.
 * @returns The cached data or null if not found or on error.
 */
export const cache_get = async (cache_key: string) => {
  try {
    const data = await redis.json.get(cache_key, '$')
    return data
  } catch (e) {
    console.error(`Error retrieving cached response: ${e}`)
    return null
  }
}
