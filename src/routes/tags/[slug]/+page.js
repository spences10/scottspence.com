import { getPostTags } from '$lib/get-post-tags'

export const load = async ({ params }) => {
  const { slug } = params
  const { postsByTag } = await getPostTags()
  return {
    slug,
    postsByTag,
  }
}
