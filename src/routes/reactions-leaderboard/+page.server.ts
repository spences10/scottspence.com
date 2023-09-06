import { reactions } from '$lib/reactions-config.js'
import { redis } from '$lib/redis.js'

const fetch_posts_data = async (fetch: Fetch): Promise<Post[]> => {
  const response = await fetch('posts.json')
  return await response.json()
}

const fetch_reaction_data = async (): Promise<ReactionPage[]> => {
  const keys = await redis.keys('reactions:*')
  return await Promise.all(
    keys.map(async (key: string) => {
      const count = await redis.get(key)
      return {
        path: key,
        count: parseInt(count as string, 10),
      }
    }),
  )
}

const transform_leaderboard = (
  pages: ReactionPage[],
  posts_data: Post[],
): Record<string, ReactionEntry> => {
  return pages.reduce(
    (acc: Record<string, ReactionEntry>, { path, count }) => {
      const [_, post_path, reaction_type] = path.split(':')
      const stripped_path = post_path.replace('/posts/', '')

      if (!acc[post_path]) {
        acc[post_path] = { path: post_path }
      }

      const post = posts_data.find(
        (p: Post) => p.slug === stripped_path,
      )
      if (post) {
        acc[post_path].title = post.title
      }

      acc[post_path][reaction_type] = count

      const reaction_info = reactions.find(
        r => r.type === reaction_type,
      )
      if (reaction_info) {
        acc[post_path][`${reaction_type}_emoji`] = reaction_info.emoji
      }

      return acc
    },
    {},
  )
}

const get_leaderboard = async (fetch: Fetch) => {
  const [posts_data, reaction_data] = await Promise.all([
    fetch_posts_data(fetch),
    fetch_reaction_data(),
  ])

  const sorted_pages = reaction_data.sort((a, b) => b.count - a.count)

  const leaderboard = transform_leaderboard(sorted_pages, posts_data)
  return Object.values(leaderboard)
}

export const load = async ({ fetch }) => {
  const leaderboard = await get_leaderboard(fetch)
  return {
    leaderboard,
  }
}
