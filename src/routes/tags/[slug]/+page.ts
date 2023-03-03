import { getPostTags } from '$lib/get-post-tags'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const { slug } = params
  const { postsByTag } = getPostTags()
  return {
    slug,
    postsByTag,
  }
}
