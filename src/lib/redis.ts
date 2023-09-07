import { building } from '$app/environment'
import {
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
} from '$env/static/private'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

let redis: Redis
let ratelimit: Ratelimit

if (!building) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  })

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
  })
}

export const current_visitors_key = (): string => `current_visitors:`

/**
 * Generates a cache key for a given set of parameters.
 * `page_views` or `current_visitors` used for `cache_key_prefix`
 * for human readable cache key.
 *
 * @param cache_key_prefix - The key prefix when generating the cache key.
 * @param url - The URL to include in the cache key.
 * @param params - An object containing query parameters to include in the cache key.
 * @returns The generated cache key.
 */
export const page_views_key = (
  cache_key_prefix: string,
  params: any,
): string => {
  // Parse the filters property
  const filters = JSON.parse(params.filters || '[]')
  const pathname = filters.length > 0 ? filters[0].value : ''

  // Extract the slug from the pathname
  const slug = pathname.split('/').pop() || ''

  return `${cache_key_prefix}:${slug}`
}

export const popular_posts_key = (cache_key_prefix: string): string =>
  `${cache_key_prefix}`

export const exchange_rates_key = (): string => `exchange_rates:`

export const pricing_numbers_key = (): string => `pricing_numbers:`

export const get_posts_key = (): string => `get_posts:`

export { ratelimit, redis }
