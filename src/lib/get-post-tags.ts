// @ts-nocheck
import { getPosts } from '$lib/get-posts'
import slugify from 'slugify'

export function getPostTags() {
  const postsByTag = {}

  getPosts().map(post => {
    const { tags, isPrivate } = post.metadata
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
