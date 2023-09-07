import { get_posts_key, redis } from './redis'
import { time_to_seconds } from './utils'

export const get_posts = async (): Promise<{ posts: Post[] }> => {
  try {
    const cached: Post[] | null = await redis.get(get_posts_key())
    if (cached) {
      return {
        posts: cached,
      }
    }
  } catch (error) {
    console.error('Error fetching from Redis:', error)
  }

  // cache miss, fetch from API
  const posts = await Promise.all(
    Object.entries(import.meta.glob('../../posts/**/*.md')).map(
      async ([path, resolver]) => {
        const { metadata }: any = await resolver()
        const slug = path?.split('/').pop()?.slice(0, -3) ?? null
        return { ...metadata, slug }
      },
    ),
  )

  let sortedPosts = posts.sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  )

  sortedPosts = sortedPosts.map(post => ({
    ...post,
  }))

  try {
    await redis.set(get_posts_key(), JSON.stringify(sortedPosts), {
      ex: time_to_seconds({ hours: 24 }),
    })
  } catch (error) {
    console.error('Error setting to Redis:', error)
  }

  return {
    posts: sortedPosts,
  }
}
