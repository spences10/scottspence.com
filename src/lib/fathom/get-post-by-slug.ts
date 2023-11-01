export const get_posts_by_slug = (
  posts_data: Array<Post>,
): Record<string, Post> => {
  return posts_data.reduce(
    (acc: Record<string, Post>, post: Post) => {
      if (post.slug) {
        acc[post.slug] = post
      }
      return acc
    },
    {} as Record<string, Post>,
  )
}
