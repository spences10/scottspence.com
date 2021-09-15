import { posts } from './_posts'

export async function get() {
  const array = Object.keys(posts).map(key => posts[key])
  array.sort((b, a) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    if (da < db) return -1
    if (da === db) return 0
    if (da > db) return 1
  })
  // console.log('=====================')
  // console.log(array)
  // console.log('=====================')
  // posts.map(p => {
  //   console.log('=====================')
  //   console.log(p.slug)
  //   console.log('=====================')
  // })
  return {
    body: { posts: array },
  }
}
