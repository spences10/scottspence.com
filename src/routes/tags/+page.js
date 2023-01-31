import { getPostTags } from '$lib/get-post-tags'

export const load = async () => {
  const { tags, postsByTag } = await getPostTags()
  return {
    tags,
    postsByTag,
  }
}
