import { getPosts } from '$lib/get-posts'

export async function getPostTags() {
  const posts = await getPosts()
  const postsByTag = {}

  posts.forEach(post => {
    const { tags, isPrivate } = post
    if (tags && !isPrivate) {
      tags.forEach(tag => {
        if (!postsByTag[tag]) {
          postsByTag[tag] = []
        }
        postsByTag[tag].push(post)
      })
    }
  })

  const tags = Object.keys(postsByTag)

  // tags.forEach(tag => {
  //   const posts = postsByTag[tag]

  //   console.log('=====================')
  //   console.log(`tag`, tag)
  //   console.log(`posts`, posts)
  //   console.log('=====================')
  // })

  return tags
}
