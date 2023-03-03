import { getPostTags } from '$lib/utils'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params }) => {
  const { slug } = params
  const { postsByTag } = getPostTags()
  return {
    slug,
    postsByTag,
  }
}
