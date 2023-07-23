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

  return {
    popular_posts: {
      popular_posts_daily,
      popular_posts_monthly,
      popular_posts_yearly,
    },
  }
  //   const posts: Post[] = shuffle_array(POPULAR_POSTS).slice(0, 4)

  //   // loop through posts and fetch data
  //   const popular_posts_analytics = await Promise.all(
  //     posts.map(async (post: Post) => {
  //       const url = new URL('/analytics.json', 'http://localhost')
  //       const params = new URLSearchParams({
  //         pathname: post.path,
  //         cache_duration: time_to_seconds({ hours: 24 }).toString(),
  //       })
  //       url.search = params.toString()

  //       const res = await fetch(url.pathname + url.search)
  //       const { analytics }: { analytics: AnalyticsItem[] } =
  //         await res.json()

  //       return {
  //         popular_posts: {
  //           analytics: analytics.map((item: AnalyticsItem) => ({
  //             ...item,
  //             title: post.title,
  //           })),
  //         },
  //       }
  //     })
  //   )

  //   // get current visitors
  //   const fetch_visitors = async () => {
  //     try {
  //       const url = new URL(
  //         '/current-visitors.json',
  //         'http://localhost'
  //       )
  //       const params = new URLSearchParams({
  //         cache_duration: time_to_seconds({ minutes: 15 }).toString(),
  //       })
  //       url.search = params.toString()

  //       const res = await fetch(url.pathname + url.search)
  //       const { visitors } = await res.json()
  //       return visitors
  //     } catch (error) {
  //       console.error(`Error fetching visitors: ${error}`)
  //       return null
  //     }
  //   }

  //   return {
  //     popular_posts_analytics,
  //     visitors: await fetch_visitors(),
  //   }
}
