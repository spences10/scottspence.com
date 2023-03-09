import { get_posts } from '$lib/posts'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = true

export const GET: RequestHandler = async () => {
  const { posts } = await get_posts()
  return new Response(JSON.stringify(posts, null, 2))
}
