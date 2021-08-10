---
date: 2021-08-09
title: Make an RSS Feed for your SvelteKit Project
tags: ['svelte', 'sveltekit', 'rss', 'feed', 'guide', 'how-to']
isPrivate: true
---

<script>
  import Details from '$lib/components/details.svelte'
</script>

The indie web is alive and well and there are more and more people
taking control and owning their online presence and also how they
consume other content. One way to help consumers of your site know
that there is new content available is by making your content
available via an RSS feed.

I made an RSS feed for my [blog] using SvelteKit routes. Much like the
[Sitemap Generation for Dynamic Routes In NextJS with the Sanity
Client] post I did back in February.

## RSS route

So as my blog is a SvelteKit project I can use the SvelteKit [routing
endpoints] to define the data type I want returned from that endpoint.

RSS feeds are expected in XML format and I want my endpoint to be
[`https://scottspence.com/rss.xml`] so I'll define a file in my routes
folder called `rss.xml.js` this is located in the routes folder of the
project, so the full path would be `src/routes/rss.xml.js`.

`rss.xml.js`

In the file define the `get` function and set up the headers:

```js
export async function get() {
  const headers = {
    'Cache-Control': 'max-age=0, s-maxage=600',
    'Content-Type': 'application/xml',
  }
  return {
    headers,
  }
}
```

<Details buttonText="Expand to see the full code.">

```js
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

const render =
  postsMeta => `<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
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
          <content:encoded>${meta.previewHtml} 
            <div style="margin-top: 50px; font-style: italic;">
              <strong>
                <a href="${website}/posts/${meta.slug}/">
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
```

</Details>

David Parker has a [great post] on this with a more generic example
for getting the posts data for the feed.

<!-- Links -->

[blog]: https://scottspence.com/posts
[sitemap generation for dynamic routes in nextjs with the sanity client]:
  https://scottspence.com/posts/dynamic-sitemap-generation-with-nextjs-and-sanity
[routing endpoints]: https://kit.svelte.dev/docs#routing-endpoints
[`https://scottspence.com/rss.xml`]: https://scottspence.com/rss.xml
[great post]:
  https://www.davidwparker.com/posts/how-to-make-an-rss-feed-in-sveltekit
