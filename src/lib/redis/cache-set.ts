import { redis } from './client'

/**
 * Caches a response in Redis.
 *
 * @param cache_key - The cache key to use for storing the response.
 * @param data - The data to cache.
 * @param cache_duration -` The number of seconds to cache the data for.
 */
export const cache_set = async (
  cache_key: string,
  data: any,
  cache_duration: number,
) => {
  try {
    await redis.json.set(cache_key, '$', JSON.stringify(data))
    await redis.expire(cache_key, cache_duration)
  } catch (e) {
    console.error(`Error caching response: ${e}`)
  }
}
