import { getPosts } from '$lib/get-posts'

export const load = async () => {
  return {
    posts: getPosts().map(post => post.metadata),
  }
}
