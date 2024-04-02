import { get_post_tags } from '$lib/post-tags'
import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'

export const GET: RequestHandler = async () => {
  const { tags, posts_by_tag } = await get_post_tags()

  return json({ tags, posts_by_tag })
}
