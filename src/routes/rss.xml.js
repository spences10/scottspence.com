import { getPosts } from '$lib/get-posts'
import { description, name, website } from '$lib/info'
import { format } from 'date-fns'

export async function get() {
  const postsMeta = await getPosts()
  const body = render(postsMeta)

  const headers = {
    'Cache-Control': `max-age=0, s-max-age=${600}`,
    'Content-Type': 'application/xml',
  }
  return {
    headers,
    body,
  }
}

const render = postsMeta => `
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>
      <![CDATA[ ${name}'s Blog! ]]>
    </title>
    <description>
      <![CDATA[ ${description} ]]>
    </description>
    <link>${website}</link>
    <generator>RSS for Node</generator>
    <lastBuildDate>Tue, 20 Jul 2021 14:52:01 GMT</lastBuildDate>
    <atom:link href="${website}/rss.xml" rel="self" type="application/rss+xml"/>
    ${postsMeta
      .map(
        meta =>
          `
        <item>
          <title>
            <![CDATA[ ${meta.title} ]]>
          </title>
          <description>
            <![CDATA[ ${meta.preview} ]]>
          </description>
          <link>${website}/posts/${meta.slug}/</link>
          <guid isPermaLink="false">${website}/posts/${
            meta.slug
          }/</guid>
          <dc:creator>
            <![CDATA[ ${name} ]]>
          </dc:creator>
          <pubDate>
            ${format(
              new Date(meta.date),
              'EE, dd MMM yyyy HH:mm:ss O'
            )}
          </pubDate>
          <content:encoded>${meta.previewHtml}</content:encoded>
        </item>
      `
      )
      .join('')}
  </channel>
</rss>
  `
//   <url>
//     <loc>${website}</loc>
//     <changefreq>daily</changefreq>
//     <priority>0.7</priority>
//   </url>
//   ${postsMeta
//     .map(
//       meta => `
//   <url>
//     <loc>${website}/posts/${meta.slug}/</loc>
//     <changefreq>daily</changefreq>
//     <priority>0.7</priority>
//   </url>
//   `
//     )
//     .join('')}
// </urlset>
