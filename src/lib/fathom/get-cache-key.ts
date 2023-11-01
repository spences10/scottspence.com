import {
  current_visitors_key,
  page_views_key,
  popular_posts_key,
} from '$lib/redis'

export const get_cache_key = (
  prefix: string,
  params: Record<string, unknown>,
) => {
  switch (prefix) {
    case 'current_visitors':
      return current_visitors_key()
    case 'page_views_day':
    case 'page_views_month':
    case 'page_views_year':
      return page_views_key(prefix, params)
    case 'popular_posts_day':
    case 'popular_posts_month':
    case 'popular_posts_year':
      return popular_posts_key(prefix)
    default:
      throw new Error(`Unknown cache_key_prefix: ${prefix}`)
  }
}
