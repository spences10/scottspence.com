import { time_to_seconds } from '$lib/utils'

const fetch_popular_posts = async (
  fetch: Fetch,
  period: string,
  cache_duration: number,
) => {
  const url = `../popular-posts.json?period=${period}`
  const res = await fetch(url)

  const { analytics } = await res.json()

  return analytics || null
}

// get current visitors
const fetch_visitors = async (fetch: Fetch) => {
  try {
    const url = '../current-visitors.json'

    const res = await fetch(url)

    const { visitors } = await res.json()
    return visitors
  } catch (error) {
    console.error(`Error fetching visitors: ${error}`)
    return null
  }
}

export const load = async ({ fetch }) => {
  const [
    popular_posts_daily,
    popular_posts_monthly,
    popular_posts_yearly,
  ] = await Promise.all([
    fetch_popular_posts(fetch, 'day', time_to_seconds({ hours: 24 })),
    fetch_popular_posts(
      fetch,
      'month',
      time_to_seconds({ hours: 24 }),
    ),
    fetch_popular_posts(
      fetch,
      'year',
      time_to_seconds({ hours: 24 }),
    ),
  ])

  const visitors = await fetch_visitors(fetch)

  return {
    visitors,
    popular_posts: {
      popular_posts_daily,
      popular_posts_monthly,
      popular_posts_yearly,
    },
  }
}
