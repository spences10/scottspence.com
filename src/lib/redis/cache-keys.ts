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

export const pricing_numbers_key = (): string => `pricing_numbers`

export const get_posts_key = (): string => `get_posts:`

export const get_reactions_leaderboard_key = (): string =>
  `reactions_leaderboard:`

export const get_newsletter_subscriber_count_key = (): string =>
  `newsletter_subscriber_count:`
