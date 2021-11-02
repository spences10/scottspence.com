import { getPostTags } from '@lib/get-post-tags'
import { getPosts } from '@lib/get-posts'
import { website } from '@lib/info'
import slugify from 'slugify'

export const get = async () => {
  const postsMeta = await getPosts()
  const { tags } = await getPostTags()
  const pages = [
    `about`,
    `faq`,
    `newsletter`,
    `now`,
    `portfolio`,
    `privacy-policy`,
  ]
  const body = render(pages, tags, postsMeta)

  const headers = {
    'Cache-Control': 'max-age=0, s-maxage=3600',
    'Content-Type': 'application/xml',
  }
  return {
    headers,
    body,
  }
}

const render = (
  pages,
  tags,
  postsMeta
) => `<?xml version="1.0" encoding="UTF-8" ?>
<urlset 
  xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
  xmlns:xhtml="https://www.w3.org/1999/xhtml"
  xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
  xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
  xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
  <url>
    <loc>${website}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  ${pages
    .map(
      page => `
  <url>
    <loc>${website}/${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  `
    )
    .join('')}
  ${tags
    .map(
      tag => `
  <url>
    <loc>${website}/tags/${slugify(tag)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  `
    )
    .join('')}
  ${postsMeta
    .map(meta =>
      meta.isPrivate
        ? null
        : `
  <url>
    <loc>${website}/posts/${meta.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  `
    )
    .join('')}
</urlset>
`
