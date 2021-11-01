import { getPosts } from '$lib/get-posts'
import { description, name, website } from '$lib/info'
import { format } from 'date-fns'

export const get = async () => {
  const postsMeta = await getPosts()
  const body = render(postsMeta)

  const headers = {
    'Cache-Control': 'max-age=0, s-maxage=3600',
    'Content-Type': 'application/xml',
  }
  return {
    headers,
    body,
  }
}

const render =
  postsMeta => `<rss xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:content="https://purl.org/rss/1.0/modules/content/" xmlns:atom="https://www.w3.org/2005/Atom" version="2.0">
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
    ${postsMeta
      .map(
        meta =>
          `
        <item>
          <title>
            <![CDATA[ ${meta.metadata.title} ]]>
          </title>
          <description>
            <![CDATA[ ${meta.metadata.preview} ]]>
          </description>
          <link>${website}/posts/${meta.metadata.slug}/</link>
          <guid isPermaLink="false">${website}/posts/${
            meta.metadata.slug
          }/</guid>
          <dc:creator>
            <![CDATA[ ${name} ]]>
          </dc:creator>
          <pubDate>
            ${format(
              new Date(meta.metadata.date),
              'EE, dd MMM yyyy HH:mm:ss O'
            )}
          </pubDate>
          <content:encoded>${meta.metadata.previewHtml} 
            <div style="margin-top: 50px; font-style: italic;">
              <strong>
                <a href="${website}/posts/${meta.metadata.slug}">
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
