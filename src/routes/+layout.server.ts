import { time_to_seconds } from '$lib/utils'

const fetch_data = async (fetch: Fetch, url: string, key: string) => {
  try {
    const res = await fetch(url)
    const data = await res.json()
    return data[key] || null
  } catch (error) {
    console.error(`Error fetching ${key}: ${error}`)
    return null
  }
}

export const load = async ({ fetch }) => {
  const cache_duration = time_to_seconds({ hours: 24 }).toString()

  // Fetch Popular Posts
  const popular_posts_promises = ['day', 'month', 'year'].map(
    period =>
      fetch_data(
        fetch,
        `../popular-posts.json?period=${period}&cache_duration=${cache_duration}`,
        'analytics',
      ),
  )

  // Fetch Visitors
  const visitors_promise = fetch_data(
    fetch,
    '../current-visitors.json',
    'visitors',
  )

  const [
    popular_posts_daily,
    popular_posts_monthly,
    popular_posts_yearly,
  ] = await Promise.all(popular_posts_promises)

  const visitors = await visitors_promise

  return {
    visitors,
    popular_posts: {
      popular_posts_daily,
      popular_posts_monthly,
      popular_posts_yearly,
    },
  }
}
