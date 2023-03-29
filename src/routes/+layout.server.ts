import { POPULAR_POSTS } from '$lib/info'
import { shuffle_array, time_to_seconds } from '$lib/utils'

interface Post {
  path: string
  title: string
}

interface AnalyticsItem {
  visits: string
  uniques: string
  pageviews: string
  avg_duration: string
  bounce_rate: number
  pathname: string
}

export const load = async ({ fetch }) => {
  const posts: Post[] = shuffle_array(POPULAR_POSTS).slice(0, 4)

  // loop through posts and fetch data
  const popular_posts_analytics = await Promise.all(
    posts.map(async (post: Post) => {
      const res = await fetch(
        `../analytics.json?pathname=${
          post.path
        }&cache_duration=${time_to_seconds({ hours: 24 })}`
      )
      const { analytics }: { analytics: AnalyticsItem[] } =
        await res.json()

      return {
        popular_posts: {
          analytics: analytics.map((item: AnalyticsItem) => ({
            ...item,
            title: post.title,
          })),
        },
      }
    })
  )

  // get current visitors
  const fetch_visitors = async () => {
    try {
      const res = await fetch(
        `../current-visitors.json?cache_duration=${time_to_seconds({
          minutes: 15,
        })}`
      )
      const { visitors } = await res.json()
      return visitors
    } catch (error) {
      console.error(`Error fetching visitors: ${error}`)
      return null
    }
  }

  return {
    popular_posts_analytics,
    visitors: await fetch_visitors(),
  }
}
