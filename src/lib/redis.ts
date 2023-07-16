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

export function page_analytics_key(slug: string): string {
  // Replace characters that would be URL encoded and slashes with ':'
  const sanitised_slug = slug.replace(/[%?&=/]/g, ':')
  return `slug:${sanitised_slug}`
}

export { ratelimit, redis }
