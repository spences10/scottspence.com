import { get_posts } from '$lib/posts'

interface PostsByTag {
  [tag: string]: any[]
}

export const get_post_tags = async () => {
  let posts_by_tag: PostsByTag = {}

  const { posts } = await get_posts()

  posts.map(post => {
    const { tags, isPrivate } = post
    if (tags && !isPrivate) {
      tags.forEach((post_tag: string) => {
        const tag = post_tag
        if (!posts_by_tag[tag]) {
          posts_by_tag[tag] = []
        }
        posts_by_tag[tag].push(post)
      })
    }
  })

  const tags = Object.keys(posts_by_tag).sort()

  return {
    tags,
    posts_by_tag,
  }
}
