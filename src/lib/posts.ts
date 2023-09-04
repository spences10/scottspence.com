export const get_posts = async () => {
  // taken from josh-collinsworth's blog starter! Thanks Josh!
  // https://github.com/josh-collinsworth/sveltekit-blog-starter/blob/fd8a4c474017fc8b3c131c517177a7c4e0e55fa3/src/lib/assets/js/fetchPosts.js
  const posts = await Promise.all(
    Object.entries(import.meta.glob('../../posts/**/*.md')).map(
      async ([path, resolver]) => {
        const { metadata }: any = await resolver()
        const slug = path?.split('/').pop()?.slice(0, -3) ?? null
        return { ...metadata, slug }
      }
    )
  )

  let sortedPosts = posts.sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  )

  sortedPosts = sortedPosts.map(post => ({
    ...post,
  }))

  return {
    posts: sortedPosts,
  }
}
