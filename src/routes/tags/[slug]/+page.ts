export const load = async ({ params, fetch }) => {
  const { slug } = params
  const res = await fetch(`/post-tags.json`)
  if (res.ok) {
    const { posts_by_tag } = await res.json()
    return {
      slug,
      posts_by_tag,
    }
  }
}
