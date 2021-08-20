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

## RSS on [`scottspence.com`](https://scottspence.com)

So as my blog is a SvelteKit project I can use the SvelteKit [routing
endpoints] to define the data type I want returned from that endpoint.

RSS feeds are expected in XML format and I want my endpoint to be
[`https://scottspence.com/rss.xml`] so I've defined a file in my
routes folder called `rss.xml.js` this is located in the routes folder
of the project, so the full path would be `src/routes/rss.xml.js`.

## RSS route

For this guide I'll using the great [template from Matt Jennings]
(which this blog is based off of) as an example of how to do it.

I'm using the template as it's the most basic example to use and there
won't be any additional user specific routes that will need to be
taken into account.

Let's take a quick look at how the project is structured:

```bash
sveltekit-blog-template/
├─ posts/
├─ src/
│ └─ lib/
│ └─ routes/
│ │ └─ posts/
│ │   └─ [slug].svelte/
│ │─ __layout.svelte/
│ └─ index.svelte/
...rest of the files
```

I've left some of the filing structure that isn't relevant right now.

For now I want to focus on the routes folder as this is where I'll be
creating the RSS page.

<!-- Links -->

[blog]: https://scottspence.com/posts
[sitemap generation for dynamic routes in nextjs with the sanity client]:
  https://scottspence.com/posts/dynamic-sitemap-generation-with-nextjs-and-sanity
[routing endpoints]: https://kit.svelte.dev/docs#routing-endpoints
[`https://scottspence.com/rss.xml`]: https://scottspence.com/rss.xml
[template from matt jennings]:
  https://github.com/mattjennings/sveltekit-blog-template
