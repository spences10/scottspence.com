import { get_post_tags } from '$lib/post-tags'
import type { RequestHandler } from '@sveltejs/kit'

export const prerender = true

export const GET: RequestHandler = async () => {
  const { tags, posts_by_tag } = await get_post_tags()
  return new Response(JSON.stringify({ tags, posts_by_tag }, null, 2))
}
