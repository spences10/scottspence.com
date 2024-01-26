import { description, name, website } from '$lib/info'
import { get_posts } from '$lib/posts'
import { addHours, format, isAfter } from 'date-fns'

interface CacheEntry {
  value: string
  timestamp: Date
}

const url_cache = new Map<string, CacheEntry>()

function add_to_cache(slug: string, url: string) {
  const entry: CacheEntry = {
    value: url,
    timestamp: new Date(),
  }
  url_cache.set(slug, entry)
}

function get_from_cache(slug: string): string | undefined {
  const entry = url_cache.get(slug)
  if (entry) {
    if (isAfter(new Date(), addHours(entry.timestamp, 1))) {
      url_cache.delete(slug)
      return undefined
    }
    return entry.value
  }
  return undefined
}

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

const render = (posts_metadata: Post[]) => {
  return `<rss xmlns:dc="https://purl.org/dc/elements/1.1/" xmlns:content="https://purl.org/rss/1.0/modules/content/" xmlns:atom="https://www.w3.org/2005/Atom" version="2.0">
    <channel>
      <title>
        <![CDATA[ ${name}'s Blog! ]]>
      </title>
      <description>
        <![CDATA[ ${description} ]]>
      </description>
      <link>${website}</link>
      <generator>RSS for Node</generator>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${website}/rss.xml" rel="self" type="application/rss+xml"/>
      ${posts_metadata
        .map(({ title, preview, slug, date, previewHtml }) => {
          if (slug === null) {
            // Handle the case when slug is null
            // For example, skip this post or use a default value
            return ''
          }
          const cached_url =
            get_from_cache(slug) || `${website}/posts/${slug}/`
          if (!get_from_cache(slug)) {
            add_to_cache(slug, cached_url)
          }
          return `
            <item>
              <title>
                <![CDATA[ ${title} ]]>
              </title>
              <description>
                <![CDATA[ ${preview} ]]>
              </description>
              <link>${cached_url}</link>
              <guid isPermaLink="false">${cached_url}</guid>
              <dc:creator>
                <![CDATA[ ${name} ]]>
              </dc:creator>
              <pubDate>
                ${format(new Date(date), 'EEE, dd MMM yyyy HH:mm:ss O')}
              </pubDate>
              <content:encoded>
                ${previewHtml} 
                <div style="margin-top: 50px; font-style: italic;">
                  <strong>
                    <a href="${cached_url}">
                      Keep reading
                    </a>.
                  </strong>  
                </div>
              </content:encoded>
            </item>
          `
        })
        .join('')}
    </channel>
  </rss>`
}
