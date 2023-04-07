import { description, name, website } from '$lib/info'
import { get_posts } from '$lib/posts'
import { format } from 'date-fns'
import type { Post } from '../../types'

export const prerender = true

export const GET = async () => {
  const { posts: posts_metadata } = await get_posts()

  const body = render(posts_metadata)

  return new Response(body, {
    headers: {
      'content-type': 'application/xml',
      'cache-control':
        'public, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=3600',
    },
  })
}

const render = (
  posts_metadata: Post[]
) => `<rss xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:content="https://purl.org/rss/1.0/modules/content/" xmlns:atom="https://www.w3.org/2005/Atom" version="2.0">
  <channel>
    <title>
      <![CDATA[ ${name}'s Blog! ]]>
    </title>
    <description>
      <![CDATA[ ${description} ]]>
    </description>
    <link>${website}</link>
    <generator>RSS for Node</generator>
    <lastBuildDate>${new Date()}</lastBuildDate>
    <atom:link href="${website}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts_metadata
      .map(
        ({ title, preview, slug, date, previewHtml }) =>
          `
        <item>
          <title>
            <![CDATA[ ${title} ]]>
          </title>
          <description>
            <![CDATA[ ${preview} ]]>
          </description>
          <link>${website}/posts/${slug}/</link>
          <guid isPermaLink="false">${website}/posts/${slug}/</guid>
          <dc:creator>
            <![CDATA[ ${name} ]]>
          </dc:creator>
          <pubDate>
            ${format(new Date(date), 'EE, dd MMM yyyy HH:mm:ss O')}
          </pubDate>
          <content:encoded>${previewHtml} 
            <div style="margin-top: 50px; font-style: italic;">
              <strong>
                <a href="${website}/posts/${slug}">
                  Keep reading
                </a>.
              </strong>  
            </div>
          </content:encoded>
        </item>
      `
      )
      .join('')}
  </channel>
</rss>
`
