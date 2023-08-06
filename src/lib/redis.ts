import { building } from '$app/environment'
import {
  UPSTASH_REDIS_REST_TOKEN,
  UPSTASH_REDIS_REST_URL,
  VISITORS_KEY,
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

export function current_visitors_key(): string {
  return `current_visitors:${VISITORS_KEY}`
}

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
function page_views_key(
  cache_key_prefix: string,
  params: any,
): string {
  // Parse the filters property
  const filters = JSON.parse(params.filters || '[]')
  const pathname = filters.length > 0 ? filters[0].value : ''

  // Extract the slug from the pathname
  const slug = pathname.split('/').pop() || ''

  return `${cache_key_prefix}:${slug}`
}

function popular_posts_key(cache_key_prefix: string): string {
  return `${cache_key_prefix}`
}

function exchange_rates_key(): string {
  return `exchange_rates:`
}

export {
  exchange_rates_key,
  page_views_key,
  popular_posts_key,
  ratelimit,
  redis,
}
