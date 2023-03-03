import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  const { slug } = params
  throw redirect(301, `/posts/${slug}`)
}
