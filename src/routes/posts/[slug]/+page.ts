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
      // TODO: Fix Analytics caching
      // hourly_visits: data?.hourly_visits,
      // daily_visits: data?.daily_visits,
      // monthly_visits: data?.monthly_visits,
      // yearly_visits: data?.yearly_visits,
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
