import type { PageLoad } from './$types'

export const load: PageLoad = async ({
  params,
  data: { analytics },
}) => {
  const { slug } = params

  try {
    const post = await import(`../../../../posts/${slug}.md`)
    return {
      analytics,
      Content: post.default,
      meta: { ...post.metadata, slug },
    }
  } catch (err) {
    return {
      status: 404,
      error: err,
    }
  }
}
