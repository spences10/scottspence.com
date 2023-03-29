export const load = async ({ fetch }) => {
  const res = await fetch(`/post-tags.json`)
  if (res.ok) {
    const { tags, posts_by_tag } = await res.json()
    return {
      tags,
      posts_by_tag,
    }
  }
}
