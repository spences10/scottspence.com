import { getPostTags } from '$lib/utils'
import type { PageLoad } from './$types'

export const load: PageLoad = async () => {
  const { tags, postsByTag } = getPostTags()
  return {
    tags,
    postsByTag,
  }
}
