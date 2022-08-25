import { getPosts } from '@lib/get-posts'
import { error } from '@sveltejs/kit'

/**
 * @type {import('@sveltejs/kit').PageLoad}
 */
export const load = async ({ params }) => {
  const { slug } = params
  const post = getPosts().find(post => slug === post.metadata.slug)
  if (!post) {
    throw error(404, 'Post not found')
  }

  return {
    ...post.metadata,
    component: post.component,
  }
}
