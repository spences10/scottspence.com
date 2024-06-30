import { error, redirect } from '@sveltejs/kit'

export const GET = async ({ params }) => {
  const { slug } = params
  if (!slug) {
    error(400, 'Slug is required')
  }
  redirect(301, `/posts/${slug}`)
}
