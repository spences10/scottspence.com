import { get_post_tags } from '$lib/post-tags'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = { runtime: 'nodejs18.x' }

export const GET: RequestHandler = async () => {
  const { tags, posts_by_tag } = await get_post_tags()

  return json({ tags, posts_by_tag })
}
