import { getPostTags } from '$lib/get-post-tags'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  const { tags, postsByTag } = getPostTags()
  return {
    tags,
    postsByTag,
  }
}
