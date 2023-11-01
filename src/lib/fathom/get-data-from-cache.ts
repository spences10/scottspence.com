import { redis } from '$lib/redis'

/**
 * Retrieves data from the Redis cache.
 *
 * @param cache_key - The cache key to retrieve data for.
 * @returns The cached data, or null if the data is not in the cache.
 */
export const get_data_from_cache = async (
  cache_key: string,
): Promise<string | null> => {
  try {
    const cached = await redis.get(cache_key)
    if (cached && typeof cached === 'string') {
      return cached
    }
  } catch (e) {
    console.error(`Error fetching data from cache: ${e}`)
  }
  return null
}
