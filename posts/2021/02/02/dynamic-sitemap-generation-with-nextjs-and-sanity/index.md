---
date: 2021-02-02
title:
  Sitemap Generation for Dynamic Routes In NextJS with the Sanity
  Client
tags: ['nextjs', 'seo', 'notes']
isPrivate: false
---

A sitemap is an important for Search Engine Optimisation (SEO) because
it makes it easier for Google and other search engines to find your
site's pages.

Google ranks web pages not just websites. There is no downside of
having an XML Sitemap and having one can improve your SEO.

At the beginning of January I asked a question in the Sanity.io Slack.

![slack message asking about site map]

<!-- cSpell:ignore knut -->

The Lee Robinson solution didn't work for me so I reached out on the
Sanity slack channel and Knut being the legend he is offered up how
they have done it:

![knut slack reply]

```js
const client = require('../../client')
const sm = require('sitemap')
const defaultUrls = [
  { url: '/', changefreq: 'daily', priority: 1 },
  { url: '/pricing', priority: 0.5 },
  { url: '/pricing/compare', priority: 0.5 },
  { url: '/docs', priority: 0.7 },
  { url: '/community', priority: 0.7 },
  { url: '/blog/', changefreq: 'weekly', priority: 0.7 },
]
async function getSitemap() {
  const { routes, blogposts } = await client.fetch(`
  {
    "routes": *[_type == "route" && includeInSitemap],
    "blogposts": *[_type == 'post' && includeInSitemap == true && publishedAt < $now] | order(publishedAt desc) {
      slug
    }
  }
  `)
  const urls = routes
    .filter(({ slug = {} }) => slug.current)
    .reduce(
      (acc, route) => [
        ...acc,
        {
          url: route.slug.current,
          priority: route.sitemapPriority || 0.5,
        },
      ],
      defaultUrls
    )
  const blogUrls = blogposts
    .filter(({ slug = {} }) => slug.current)
    .map(post => {
      return {
        url: `/blog/${post.slug.current}`,
        priority: 0.5,
      }
    })
  return sm.createSitemap({
    hostname: 'https://www.sanity.io',
    cacheTime: 600000,
    urls: urls.concat(blogUrls),
  })
}
module.exports = function sitemapXML(req, res, next) {
  res.setHeader('Content-Type', 'application/xml')
  getSitemap()
    .then(result => {
      res.send(result.toString())
    })
    .catch(next)
}
```

<!-- cSpell:ignore weis -->

I was just about to start getting my head around how that was done
then James Weis came in with setting the headers to `text/xml`

![james weis reply headers to text/xml]

This made a lot more sense to me so I implemented this straight away.

Create the file as `pages/sitemap.xml.js` then the following:

<!-- cSpell:ignore groq -->

```js
import groq from 'groq'
import sanityClient from '../sanity-client'

export default function SiteMap() {
  return <div>loading</div>
}

export async function getServerSideProps({ res }) {
  const baseUrl = `https://myawesomesite.com`
  const query = groq`{
      "countries": *[_type == 'country']{slug},
    }`
  const urls = await sanityClient.fetch(query)
  const countries = urls.countries.map(page => {
    const slug =
      page.slug.current === '/' ? '/' : `/${page.slug.current}`
    return `
      <loc>${baseUrl}${slug}</loc>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    `
  })

  const locations = [...countries]
  const createSitemap = () => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${locations
          .map(location => {
            return `<url>
                      ${location}
                    </url>
                  `
          })
          .join('')}
    </urlset>
    `
  res.setHeader('Content-Type', 'text/xml')
  res.write(createSitemap())
  res.end()
  return {
    props: {},
  }
}
```

This is genius!

So what the code block there is doing is saving the file as the
sitemap and it's located with the rest of the pages as `sitemap.xml`,
this can them be added to the Google search console as the sitemap and
located as `https://myawesomesite.com/sitemap.xml`.

I asked for permission to document this from James and he was happy
with being mentioned, thanks James. 🙏

![asking for permission to add this content to my blog]

<!-- Images -->

[slack message asking about site map]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/slack-message-asking-about-site-map-eb4b170b1db4454e381d622f3374b6cd.png
[knut slack reply]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858538/scottspence.com/knut-slack-reply-09be06278ce5133cf55987bd7be2a328.png
[james weis reply headers to text/xml]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858537/scottspence.com/james-weis-reply-headers-to-text-xml-38b5a75fc9ea820d41bc3cf287eae85f.png
[asking for permission to add this content to my blog]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1614858538/scottspence.com/credit-james-4b96034fad83ad2aab9b4d85238a7260.png
