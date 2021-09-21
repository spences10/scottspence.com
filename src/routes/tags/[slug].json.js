import { tagsByPost } from './_tags'

export async function get(req) {
  const { slug } = req.params

  const sortedTags = Object.keys(tagsByPost).map(
    key => tagsByPost[key]
  )

  const matchesSlug = arr => {
    if (arr.find(element => element === slug)) return slug
  }

  const tag = sortedTags.filter(tag => matchesSlug(tag.tags) === slug)

  return {
    body: { tag },
  }
}
