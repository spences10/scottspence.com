import { getPosts } from '$lib/get-posts'
import { description, name, website } from '$lib/info'
import { format } from 'date-fns'

export const GET = async () => {
  const postsMeta = getPosts()
  const body = render(postsMeta)

  return new Response(body, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': 'max-age=0, s-maxage=3600',
    },
  })
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
        ({ metadata }) =>
          `
        <item>
          <title>
            <![CDATA[ ${metadata.title} ]]>
          </title>
          <description>
            <![CDATA[ ${metadata.preview} ]]>
          </description>
          <link>${website}/posts/${metadata.slug}/</link>
          <guid isPermaLink="false">${website}/posts/${
            metadata.slug
          }/</guid>
          <dc:creator>
            <![CDATA[ ${name} ]]>
          </dc:creator>
          <pubDate>
            ${format(
              new Date(metadata.date),
              'EE, dd MMM yyyy HH:mm:ss O'
            )}
          </pubDate>
          <content:encoded>${metadata.previewHtml} 
            <div style="margin-top: 50px; font-style: italic;">
              <strong>
                <a href="${website}/posts/${metadata.slug}">
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
