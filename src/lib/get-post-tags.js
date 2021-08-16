import { getPosts } from '$lib/get-posts'
import slugify from 'slugify'

export async function getPostTags() {
  const posts = await getPosts()
  const postsByTag = {}

  posts.forEach(post => {
    const { tags, isPrivate } = post
    if (tags && !isPrivate) {
      tags.forEach(postTag => {
        const tag = slugify(postTag)
        if (!postsByTag[tag]) {
          postsByTag[tag] = []
        }
        postsByTag[tag].push(post)
      })
    }
  })

  const tags = Object.keys(postsByTag).sort()

  return {
    tags,
    postsByTag,
  }
}
