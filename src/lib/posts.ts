import { isBefore, subDays } from 'date-fns'
import { turso_client } from './turso'

// In-memory cache to store posts temporarily
const posts_cache = new Map()

export const get_posts = async (): Promise<{ posts: Post[] }> => {
  const client = turso_client()
  let sorted_posts: Post[] = []

  try {
    // Attempt to retrieve posts from in-memory cache
    const cached_posts = posts_cache.get('sorted_posts')
    // Check if the cached timestamp is within the last 24 hours
    if (
      cached_posts &&
      isBefore(
        subDays(new Date(), 1),
        new Date(cached_posts.timestamp),
      )
    ) {
      return { posts: cached_posts.data }
    }

    // Fetch posts from the Turso database
    const posts_result = await client.execute(
      'SELECT * FROM posts ORDER BY date DESC;',
    )
    sorted_posts = posts_result.rows as unknown as Post[]

    // Update in-memory cache
    posts_cache.set('sorted_posts', {
      timestamp: Date.now(),
      data: sorted_posts,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
  }

  return {
    posts: sorted_posts,
  }
}
