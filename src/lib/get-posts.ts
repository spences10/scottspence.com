// @ts-nocheck
export function getPosts() {
  const posts = Object.entries(
    import.meta.glob('/posts/**/*.md', { eager: true })
  )
    .map(([, post]) => {
      return {
        metadata: post.metadata,
        component: post.default,
      }
    })
    // sort by date
    .sort((b, a) => {
      const da = new Date(a.metadata.date).getTime()
      const db = new Date(b.metadata.date).getTime()
      if (da < db) return -1
      if (da === db) return 0
      if (da > db) return 1
    })

  return posts
}
