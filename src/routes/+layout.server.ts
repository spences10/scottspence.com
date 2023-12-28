import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = { runtime: 'nodejs18.x' }

export const load = async ({ fetch }) => {
  // Fetch Popular Posts
  const res = await fetch(`../api/fetch-popular-posts`)

  if (res.ok) {
    const { daily, monthly, yearly } = await res.json()
    return {
      popular_posts: {
        popular_posts_daily: daily,
        popular_posts_monthly: monthly,
        popular_posts_yearly: yearly,
      },
    }
  }
}
