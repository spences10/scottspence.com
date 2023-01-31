import { getPostTags } from '$lib/get-post-tags'
import { getPosts } from '$lib/get-posts'
import { website } from '$lib/info'
import slugify from 'slugify'

export const GET = async () => {
  const postsMeta = getPosts()
  const { tags } = getPostTags()
  const pages = [
    { page: `about`, updated: `2022-08-22` },
    { page: `contact`, updated: `2022-03-01` },
    { page: `faq`, updated: `2022-08-22` },
    { page: `newsletter`, updated: `2022-08-22` },
    { page: `now`, updated: `2022-08-22` },
    { page: `portfolio`, updated: `2022-08-22` },
    { page: `privacy-policy`, updated: `2022-08-22` },
    { page: `speaking`, updated: `2023-01-17` },
    { page: `uses`, updated: `2022-08-22` },
  ]

  const body = render(pages, tags, postsMeta)

  return new Response(body, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': 'max-age=0, s-maxage=3600',
    },
  })
}

const render = (pages, tags, postsMeta) => {
  const lastMod = new Date().toISOString().split('T')[0]
  return `<?xml version="1.0" encoding="UTF-8" ?>
  <urlset 
    xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
    xmlns:xhtml="https://www.w3.org/1999/xhtml"
    xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
  >
  <!--
    looks like changefreq isn't used by Google anymore
    https://twitter.com/askRodney/status/1615409186782715904
    https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
    https://stackoverflow.com/questions/20257299/sitemap-xml-should-i-prefer-lastmod-to-changefreq#20917200 
  -->
    <url>
      <loc>${website}</loc>
      <lastmod>${lastMod}</lastmod>
    </url>
    ${postsMeta
      .map(({ metadata }) =>
        metadata.isPrivate
          ? null
          : `
    <url>
      <loc>${website}/posts/${metadata.slug}</loc>
      <lastmod>${
        new Date(metadata.date).toISOString().split('T')[0]
      }</lastmod>
    </url>
    `
      )
      .join('')}
    ${pages
      .map(
        ({ page, updated }) => `
    <url>
      <loc>${website}/${page}</loc>
      <lastmod>${updated}</lastmod>
    </url>
    `
      )
      .join('')}
    ${tags
      .map(
        tag => `
    <url>
      <loc>${website}/tags/${slugify(tag)}</loc>
      <lastmod>${lastMod}</lastmod>
    </url>
    `
      )
      .join('')}
  </urlset>
`
}
