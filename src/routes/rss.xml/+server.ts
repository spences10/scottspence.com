import { description, name, website } from '$lib/info'
import { get_posts } from '$lib/posts'
import { addHours, isAfter } from 'date-fns'

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
  return `<feed xmlns="http://www.w3.org/2005/Atom">
    <title>${name}'s Blog!</title>
    <subtitle>${description}</subtitle>
    <link rel="alternate" type="text/html" href="${website}/"/>
    <link rel="self" type="application/atom+xml" href="${website}/rss.xml"/>
    <id>${website}/</id>
    <updated>${new Date().toISOString()}</updated>
    ${posts_metadata
      .map(({ title, preview, slug, date, preview_html }) => {
        // Check if slug is not null
        if (slug === null) {
          // Handle the null case, e.g., skip this entry
          return ''
        }

        const cached_url =
          get_from_cache(slug) || `${website}/posts/${slug}/`
        if (!get_from_cache(slug)) {
          add_to_cache(slug, cached_url)
        }

        // Use the post's date as the 'updated' timestamp
        const post_date = new Date(date).toISOString()
        return `
          <entry>
            <title>${title}</title>
            <link rel="alternate" type="text/html" href="${cached_url}"/>
            <id>${cached_url}</id>
            <published>${post_date}</published>
            <updated>${post_date}</updated>
            <author>
              <name>${name}</name>
            </author>
            <content type="html">
              <![CDATA[
                ${preview_html}
                <div style="margin-top: 50px; font-style: italic;">
                  <strong>
                    <a href="${cached_url}">
                      Keep reading
                    </a>.
                  </strong>  
                </div>
              ]]>
            </content>
          </entry>`
      })
      .join('')}
  </feed>`
}

