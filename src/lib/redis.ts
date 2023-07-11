import { REDIS_CONNECTION, VISITORS_KEY } from '$env/static/private'
import Redis from 'ioredis'

export function normalise_slug(slug: string): string {
  return slug.toLowerCase().replace(/\s+/g, '-')
}

export function current_visitors_key(): string {
  return `visitors:${VISITORS_KEY}`
}

export function page_analytics_key(slug: string): string {
  return `slug:${normalise_slug(slug)}`
}

export default REDIS_CONNECTION
  ? new Redis(REDIS_CONNECTION)
  : new Redis()
