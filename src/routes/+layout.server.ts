// import { POPULAR_POSTS } from '$lib/info'
// import { shuffle_array } from '$lib/utils'
import type { LayoutServerLoad } from './$types'
// TODO: Fix Analytics caching
export const load: LayoutServerLoad = async ({ fetch }) => {
  // const posts = shuffle_array(POPULAR_POSTS).slice(0, 4)

  // loop through posts and fetch data
  // const popular_posts_analytics = await Promise.all(
  //   posts.map(async (post: { path: any; title: any }) => {
  //     const res = await fetch(
  //       `../analytics.json?pathname=${post.path}`
  //     )
  //     const { analytics } = await res.json()

  //     return {
  //       visits: analytics[0].visits,
  //       uniques: analytics[0].uniques,
  //       pageviews: analytics[0].pageviews,
  //       title: post.title,
  //       pathname: analytics[0].pathname,
  //     }
  //   })
  // )

  // get current visitors
  // const fetch_visitors = async () => {
  //   const res = await fetch(`../current-visitors.json`)
  //   const { visitors } = await res.json()
  //   return visitors
  // }

  // return {
  //   popular_posts_analytics,
  //   visitors: fetch_visitors(),
  // }
}
