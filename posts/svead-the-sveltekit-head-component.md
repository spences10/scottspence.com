---
date: 2024-05-26
title: Svead the SvelteKit SEO Head Component
tags: ['seo', 'sveltekit', 'learning', 'notes']
isPrivate: false
---

<script>
  import { DateDistance } from '$lib/components'
</script>

Ok, it's high time I write about the Svelte head component I made back
in
[May 15, 2022](https://github.com/spences10/svead/commit/cb8062e84ee134985d35033087caf1b38a7f14b4)
(<DateDistance date='2022-05-15' /> ago). I called it Svead because
Svelte + Head = Svead, right? But after mentioning it to Puru he said
it's like Svelte + Mead 🍺! Much better!!

I have previous with making head components. Four years ago I made a
[React SEO component](https://scottspence.com/posts/react-seo-component).
It was limited but served a purpose for me! This time around for Svead
first iterations of the component I did the same.

Essentially this is for me to get my thoughts down after working on it
this weekend, I've had a refactor of the package on the cards for a
while and set to doing that
[back in January](https://github.com/spences10/svead/pull/178)! That's
where it stayed for months! I was having some issues with the
hydration markers in Svelte, I
[logged an issue](https://github.com/sveltejs/svelte/issues/10130)
about it and was kindly pointed in the right direction by
[dummdidumm](https://github.com/dummdidumm) but I hadn't picked it up
since. I started looking at it this weekend.

This time around I wanted to use Svelte 5 and incorporate JSON-LD data
into it! The Svelte 5 stuff was relatively straightforward enough, the
thing is, I also wanted to incorporate JSON-LD data into the
component.

## Acknowledgement to Rodney Lab!

Without the awesome Svelte community and me participating in
conversations on social media I would never have come across
[Rodney](https://github.com/rodneylab)! The guy will dive deep into
many subjects and JSON-LD is one of them.

He has an absolutely fantastic example of using JSON-LD in Svelte on
his
[SvelteKit MDsvex Blog Starter](https://github.com/rodneylab/sveltekit-blog-mdx/blob/main/src/lib/components/SEO/SchemaOrg.svelte),
which I duly stole and credited him for the inspiration. Without that
I probably wouldn't have started the next iteration of Svead, so, big
thanks Rodney!

Take a look at the
[SvelteKit FAQ Page SEO: add JSON‑LD Schema](https://rodneylab.com/sveltekit-faq-page-seo/)
to get an idea of where I'm going with this post.

## Basic SEO stuffs

The first iteration of the component was the basics of what you would
need, most essential the canonical link and the title tag.

This is the grand total of all the props that could be passed to the
head component:

```ts
// required props
export let url: string // Full URL of the current page
export let title: string // page title
export let description: string // page description
// optional props
export let website: string = '' // website URL
export let authorName: string = '' // Author Name
export let image: string = '' // Open Graph image
export let paymentPointer: string = '' // Web Monetisation Payment pointer
```

This is all I needed until I saw the awesomeness Rodney was doing with
JSON-LD data. I wanted to have the flexibility to use JSON-LD data in
the component so I set about making a way to have that data passed in.

Stupid me!

## What have I done?

Well, the first thing I did was mess up the previous implementation of
the component by creating one config object to pass into it. If you're
using Svead already then the next version to be released to NPM will
be a breaking change, so, be careful with that.

So, instead of implementation like this:

```svelte
<Head
  {url}
  {title}
  {description}
  {website}
  {authorName}
  {image}
  {paymentPointer}
/>
```

It's now one config object:

```svelte
<Head {seo_config} />
```

I'm missing out a load of detail here with the props, but that's the
gist of it. I wanted the one config to be passed in, this means that
the config can be composed of any number of props.

## Why stupid though?

So, this was the right decision, right? Probably not. The amount of
time I have now ploughed into this is bordering on ridiculous. I've
hinted about the many times I have stopped and started on this and it
wasn't until I started looking at the commit history that I noticed
I've had the JSON-LD data on the cards for well over a couple of years
now. 😅

It wasn't until the start of the year that I put a lot of effort into
getting it into the shape it's in now.

I initially thought, "yeah, I'll have types for everything and the DX
will be awesome" reality was I spent a _lot_ of time dicking around
with may different LLMs to get something coherent that covered all the
use-cases for JSON-LD

There's still missing functionality, I've just realised that I need a
schema for FAQ/Questions! 🙈

The types file for the `SeoConfig` config alone is currently over 400
lines long. 😅

But!

But, you do get really cool TypeDoc information when using it, so you
have a lot of information when creating a config object for your
pages.

It's a big boi tho!

Take a look a the config from the breadcrumb example page:

```ts
const seo_config: SeoConfig = {
  title: 'Example Page Title',
  description: 'This is an example description of the web page.',
  url: 'https://www.example.com/page-url',
  website: 'https://www.example.com',
  open_graph_image: 'https://www.example.com/og-image.jpg',
  language: 'en',
  author_name: 'Author Name',
  author_url: 'https://www.example.com/author',
  date_published: '2024-01-15',
  date_modified: '2024-01-16',
  publisher_name: 'Publisher Name',
  publisher_url: 'https://www.example.com/publisher',
  same_as: [
    'https://www.facebook.com/example',
    'https://www.twitter.com/example',
  ],
  schema_org_article: {
    '@type': 'Article',
    '@id': 'https://www.example.com/article',
    isPartOf: {
      '@id': 'https://www.example.com',
    },
    author: {
      '@id': 'https://www.example.com/author',
    },
    headline: 'Example Article Headline',
    datePublished: '2024-01-15',
    dateModified: '2024-01-16',
    mainEntityOfPage: {
      '@id': 'https://www.example.com/article',
    },
    publisher: {
      '@id': 'https://www.example.com/publisher',
    },
    image: {
      '@id': 'https://www.example.com/image',
    },
    articleSection: ['News', 'Technology'],
    inLanguage: 'en',
  },
  schema_org_breadcrumb_list: {
    '@type': 'BreadcrumbList',
    '@id': 'https://www.example.com/page-url',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@id': 'https://www.example.com',
          name: 'Home',
          url: 'https://www.example.com',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@id': 'https://www.example.com/category',
          name: 'Category',
          url: 'https://www.example.com/category',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@id': 'https://www.example.com/page-url',
          name: 'Example Page Title',
          url: 'https://www.example.com/page-url',
        },
      },
    ],
  },
  schema_org_webpage: {
    '@type': 'WebPage',
    '@id': 'https://www.example.com/page-url',
    url: 'https://www.example.com/page-url',
    name: 'Example Page Title',
    description: 'This is an example description of the web page.',
    inLanguage: 'en',
    isPartOf: {
      '@id': 'https://www.example.com',
    },
    breadcrumb: {
      '@id': 'https://www.example.com/page-url',
    },
    primaryImageOfPage: {
      '@id': 'https://www.example.com/image',
    },
    datePublished: '2024-01-15',
    dateModified: '2024-01-16',
    author: {
      '@id': 'https://www.example.com/author',
    },
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: ['https://www.example.com/page-url'],
      },
    ],
  },
}
```

Well over 100 lines of config!

Schema.org is vast! I've only scratched the surface here.

A lot of this is repeated in this hardcoded example. Using it in your
own pages a lot of this information can be taken from props and other
SvelteKit utilities like the `$page` store.

What was I thinking though!!

## Composability

A lot of the config for this can be a one off, added to a variable
somewhere then spread into the `SeoConfig` config object when using it
in different pages.

So that earlier example could look like this:

```ts
// Reusable website configuration
const website_config = {
  url: 'https://www.example.com',
  name: 'Example Website',
  description: 'This is an example website.',
  title: 'This is an example website.',
  language: 'en',
  author_name: 'Author Name',
  author_url: 'https://www.example.com/author',
  publisher_name: 'Publisher Name',
  publisher_url: 'https://www.example.com/publisher',
  same_as: [
    'https://www.facebook.com/example',
    'https://www.twitter.com/example',
  ],
} as SeoConfig

// Reusable breadcrumb list configuration
const breadcrumb_list_config = [
  {
    '@type': 'ListItem',
    position: 1,
    item: {
      '@id': `${website_config.url}`,
      name: 'Home',
      url: `${website_config.url}`,
    },
  },
  {
    '@type': 'ListItem',
    position: 2,
    item: {
      '@id': `${website_config.url}/category`,
      name: 'Category',
      url: `${website_config.url}/category`,
    },
  },
] as SchemaOrgBreadcrumbList['itemListElement']

// Example data for the webpage
const page_title = 'Sample Web Page'
const page_description =
  'This is an example of a web page with enhanced SEO features.'

const seo_config: SeoConfig = {
  title: 'Example Page Title',
  description: 'This is an example description of the web page.',
  url: `${website_config.url}/page-url`,
  website: website_config.url,
  open_graph_image: `${website_config.url}/og-image.jpg`,
  language: website_config.language,
  author_name: website_config.author_name,
  author_url: website_config.author_url,
  date_published: '2024-01-15',
  date_modified: '2024-01-16',
  publisher_name: website_config.publisher_name,
  publisher_url: website_config.publisher_url,
  same_as: website_config.same_as,
  schema_org_article: {
    '@type': 'Article',
    '@id': `${website_config.url}/article`,
    isPartOf: {
      '@id': website_config.url,
    },
    author: {
      '@id': website_config.author_url || '',
    },
    headline: 'Example Article Headline',
    datePublished: '2024-01-15',
    dateModified: '2024-01-16',
    mainEntityOfPage: {
      '@id': `${website_config.url}/article`,
    },
    publisher: {
      '@id': website_config.publisher_url || '',
    },
    image: {
      '@id': `${website_config.url}/image`,
    },
    articleSection: ['News', 'Technology'],
    inLanguage: website_config.language || 'en',
  },
  schema_org_breadcrumb_list: {
    '@type': 'BreadcrumbList',
    '@id': `${website_config.url}/page-url`,
    itemListElement: [
      ...breadcrumb_list_config,
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@id': `${website_config.url}/page-url`,
          name: 'Example Page Title',
          url: `${website_config.url}/page-url`,
        },
      },
    ],
  },
  schema_org_webpage: {
    '@type': 'WebPage',
    '@id': `${website_config.url}/page-url`,
    url: `${website_config.url}/page-url`,
    name: 'Example Page Title',
    description: 'This is an example description of the web page.',
    inLanguage: website_config.language || 'en',
    isPartOf: {
      '@id': website_config.url,
    },
    breadcrumb: {
      '@id': `${website_config.url}/page-url`,
    },
    primaryImageOfPage: {
      '@id': `${website_config.url}/image`,
    },
    datePublished: '2024-01-15',
    dateModified: '2024-01-16',
    author: {
      '@id': website_config.author_url || '',
    },
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: [`${website_config.url}/page-url`],
      },
    ],
  },
}
```

Then there's a load of reusable config that can be abstracted out to
fixtures/info folders and re-used.

It's also opt-in for all the JSON-LD features, so if you don't want
all that faff then don't configure it. It will still work perfectly
fine as the initial metadata tool that it was originally created as.

With this one config it also allows for further changes to be added
further down the line expanding the config object and it's uses.

## WIP

This is still _very_ much a work in progress, I'm still working on it
but this is a good starting point.

If you want to start using it now `pnpm i -D svead@next` to start
using the new API. As mentioned earlier it's fully documented and
there's an [example site](https://svead.pages.dev) with
implementations of the component.

I'd love to collaborate with you on this project, if you're interested
in helping out please get in touch.

## Tools

Here's some tools I've used to validate my work as I've been going
through it.

https://search.google.com/test/rich-results

https://validator.schema.org
