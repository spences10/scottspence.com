import { cache_set } from '$lib/redis'
import { analytics_data_with_titles } from './analytics-data-with-titles'
import { get_posts_by_slug } from './get-post-by-slug'

export const add_popular_posts_titles = async (
  fetch: Fetch,
  data: AnalyticsData[],
  cache_key: string,
  cache_duration: number,
) => {
  const posts_response = await fetch('posts.json')
  const posts_data = await posts_response.json()

  const posts_by_slug = get_posts_by_slug(posts_data)

  const data_and_titles = analytics_data_with_titles(
    data,
    posts_by_slug,
  )

  await cache_set(cache_key, data_and_titles, cache_duration)

  return data_and_titles
}
