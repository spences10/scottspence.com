import {
  analytics_data_with_titles,
  get_posts_by_slug,
} from '$lib/fathom'
import { cache_get, cache_set } from '$lib/redis'
import { time_to_seconds } from '$lib/utils'

const fetch_popular_posts = async (
  fetch: Fetch,
  url: string,
  period: string,
  cache_duration: number,
) => {
  const cache_key = `popular_posts_${period}`
  const cached = await cache_get(cache_key)

  if (cached) return cached

  try {
    const res = await fetch(url)
    const data = await res.json()
    const analytics_data = data.analytics || null

    // Get titles for the popular posts
    const posts_response = await fetch('posts.json')
    const posts_data = await posts_response.json()
    const posts_by_slug = get_posts_by_slug(posts_data)
    const result = analytics_data_with_titles(
      analytics_data,
      posts_by_slug,
    )

    await cache_set(cache_key, result, cache_duration)

    return result
  } catch (error) {
    console.error(
      `Error fetching popular posts for ${period}: ${error}`,
    )
    return null
  }
}

export const load = async ({ fetch, cookies }) => {
  const block_fathom = cookies.get('block_fathom') !== 'false'

  const cache_duration = time_to_seconds({ hours: 24 })

  // Fetch Popular Posts
  const popular_posts_promises = ['day', 'month', 'year'].map(
    period =>
      fetch_popular_posts(
        fetch,
        `../popular-posts.json?period=${period}&cache_duration=${cache_duration}`,
        period,
        cache_duration,
      ),
  )

  // Fetch Visitors
  const visitors_promise = fetch(`../current-visitors.json`)

  // Fetch newsletter subscriber count
  const subscribers_promise = fetch(`../subscribers.json`)

  const [
    popular_posts_daily,
    popular_posts_monthly,
    popular_posts_yearly,
  ] = await Promise.all(popular_posts_promises)

  const visitors_response = await visitors_promise
  const visitors = await visitors_response.json()

  const subscribers_response = await subscribers_promise
  const { newsletter_subscriber_count } =
    await subscribers_response.json()

  return {
    visitors,
    popular_posts: {
      popular_posts_daily,
      popular_posts_monthly,
      popular_posts_yearly,
    },
    newsletter_subscriber_count,
  }
}
