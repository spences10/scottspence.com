import FlexSearch from 'flexsearch'

let posts_index: FlexSearch.Index
let posts: Post[]

export const create_posts_index = (data: Post[]) => {
  posts_index = new FlexSearch.Index({ tokenize: 'forward' })

  data.forEach((post, i) => {
    const item = `${post.title} ${post.preview || ''}`
    posts_index.add(i, item)
  })

  posts = data
}

export const search_posts = (search_term: string): Post[] => {
  const match = search_term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const results = posts_index.search(match)

  return results
    .map((index) => {
      const post = posts[index as number]
      return {
        ...post,
        title: replace_text_with_marker(post.title, match),
        preview: post.preview ? get_matches(post.preview, match)[0] : ''
      }
    })
}

const get_matches = (text: string, search_term: string, limit = 1) => {
  const regex = new RegExp(search_term, 'gi')
  const indexes = []
  let matches = 0
  let match

  while ((match = regex.exec(text)) !== null && matches < limit) {
    indexes.push(match.index)
    matches++
  }

  return indexes.map((index) => {
    const start = index - 20
    const end = index + 80
    const excerpt = text.substring(start, end).trim()
    return `...${replace_text_with_marker(excerpt, search_term)}...`
  })
}

const replace_text_with_marker = (text: string, match: string) => {
  const regex = new RegExp(match, 'gi')
  return text.replaceAll(regex, (match) => `<mark>${match}</mark>`)
} 