import { redirect } from '@sveltejs/kit'

export const GET = async ({ params }) => {
  const { slug } = params
  throw redirect(301, `/posts/${slug}`)
}
