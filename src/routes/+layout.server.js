import { POPULAR_POSTS } from '@lib/info'
import { shuffle_array } from '@lib/utils'

export const load = async ({ fetch }) => {
  const posts = shuffle_array(POPULAR_POSTS).slice(0, 4)

  // loop thorugh posts and fetch data
  const post_analytics = await Promise.all(
    posts.map(async post => {
      const res = await fetch(
        `../analytics.json?pathname=${post.path}`
      )
      const { analytics } = await res.json()

      return {
        visits: analytics[0].visits,
        uniques: analytics[0].uniques,
        pageviews: analytics[0].pageviews,
        title: post.title,
        pathname: analytics[0].pathname,
      }
    })
  )

  return { post_analytics }
}
