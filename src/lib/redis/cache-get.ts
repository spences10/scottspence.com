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
    if (data && is_json_string(data as string)) {
      return JSON.parse(data as string)
    } else {
      console.warn(
        `Data for cache key ${cache_key} is not in JSON format.`,
      )
      return data
    }
  } catch (e) {
    console.error(
      `Error retrieving cached response: ${e} Cache key: ${cache_key}`,
    )
    return null
  }
}

/**
 * Checks if a string is a valid JSON string.
 *
 * @param str - The string to check.
 * @returns true if the string is a valid JSON string, false otherwise.
 */
function is_json_string(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch (e) {
    return false
  }
}
