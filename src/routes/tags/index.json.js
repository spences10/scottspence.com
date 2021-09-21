import slugify from 'slugify'
import { tagsByPost } from './_tags'

export async function get() {
  const postsByTag = {}

  tagsByPost.map(post => {
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
    body: {
      postsByTag,
      tags,
    },
  }
}
