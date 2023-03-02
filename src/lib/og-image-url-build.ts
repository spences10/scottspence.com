import { object_to_query_params } from './utils'

export const ogImageUrl = (
  author: string,
  website: string,
  title: string
) => {
  const params = {
    title,
    author,
    website: website || `scottspence.com`,
  }
  return `https://ogimggen.vercel.app/og${object_to_query_params(
    params
  )}`
}
