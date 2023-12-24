import { get_posts } from '$lib/posts'
import type { ServerlessConfig } from '@sveltejs/adapter-vercel'
import type { RequestHandler } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'

export const config: ServerlessConfig = { runtime: 'nodejs18.x' }

export const GET: RequestHandler = async () => {
  const { posts } = await get_posts()

  return json(posts)
}
