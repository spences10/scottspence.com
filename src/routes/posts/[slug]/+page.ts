export const load = async ({
  params,
  data: { daily_visits, monthly_visits, yearly_visits },
}) => {
  const { slug } = params

  try {
    const post = await import(`../../../../posts/${slug}.md`)
    return {
      daily_visits,
      monthly_visits,
      yearly_visits,
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
