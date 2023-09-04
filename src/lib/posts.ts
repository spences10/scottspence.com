import { posts_key, redis } from './redis'
import { time_to_seconds } from './utils'

export const get_posts = async () => {
  // Try to get cached posts first
  try {
    const cached_posts: string | null = await redis.get(posts_key())
    if (cached_posts) {
      return { posts: JSON.parse(cached_posts) }
    }
  } catch (e) {
    console.error(`Error fetching data from cache: ${e}`)
  }

  // if cache miss, fetch posts
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

  // Cache the fetched posts
  try {
    await redis.set(posts_key(), JSON.stringify(sortedPosts), {
      ex: time_to_seconds({ hours: 1 }),
    })
  } catch (e) {
    console.error(`Error setting data to cache: ${e}`)
  }

  return {
    posts: sortedPosts,
  }
}
