import { redis } from './client'

/**
 * Retrieves a cached response from Redis.
 *
 * @param cache_key - The cache key to use for retrieving the response.
 * @returns The cached data or null if not found or on error.
 */
export const cache_get = async (cache_key: string) => {
  try {
    const data = await redis.get(cache_key)
    return data ? JSON.parse(data as string) : null
  } catch (e) {
    console.error(
      `Error retrieving cached response: ${e} Cache key: ${cache_key}`,
    )
    return null
  }
}
