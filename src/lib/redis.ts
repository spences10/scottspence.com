import { REDIS_CONNECTION, VISITORS_KEY } from '$env/static/private'
import Redis from 'ioredis'

export function current_visitors_key(): string {
  return `visitors:${VISITORS_KEY}`
}

export function page_analytics_key(slug: string): string {
  // Replace characters that would be URL encoded and slashes with ':'
  const sanitised_slug = slug.replace(/[%?&=/]/g, ':')
  return `slug:${sanitised_slug}`
}

export default REDIS_CONNECTION
  ? new Redis(REDIS_CONNECTION)
  : new Redis()
