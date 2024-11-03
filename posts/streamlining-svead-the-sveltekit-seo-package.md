---
date: 2024-09-14
title: Streamlining Svead the SvelteKit SEO package
tags: ['seo', 'sveltekit', 'learning', 'notes']
is_private: false
---

I totally changed up the Svead package again. Svead the SvelteKit head
package is used for SEO purposes, and
[back in May](https://scottspence.com/posts/svead-the-sveltekit-head-component),
I wrote a blog post about it and the changes I made to it (behind a
`@next` flag). I was Quite jubilant because I'd actually managed to
finish it. I had been trying to get in JSON-LD data as an option for
use with it for quite some time, and it was just one of those projects
that I kept putting off. Back in May, I felt the need to write a post
because I didn't actually put anything down in writing before that
about it. Now this is the second time, with a lot of changes.

Now, the thing is, back in May, how the Svead package worked was it
was all bundled into one component `Head`. The thing with this is that
I tried to cater for every situation there was with schema.org, and it
just ended up being a real mess. Even in the blog post back in May, I
was asking myself, "was this the right decision?" at the time of
putting it together I thought "this is great! It can be composable,
and you can abstract out all the config elsewhere".

The reality was that it was a hot mess of config that caused me no end
of circling around certain scenarios and not really getting anywhere.

I even left out some of the most valuable functionality for adding in
FAQ and Questions (yes they are different things).

I had already had many a think about my life decisions many times over
up to this point and with the post in May I was just happy to get
something out there that was functional.

## Inspiration from a tweet

<!-- cspell:ignore kazuma -->

It wasn't until almost a month ago now that I saw
[a tweet from Kazuma](https://x.com/oekazuma/status/1823693401487020354)
mentioning his package
[svelte-meta-tags](https://github.com/oekazuma/svelte-meta-tags).

I had a poke around the repo to have a look at how things were being
done there and I saw in his package that he'd actually just made a
wrapper for JSON-LD data, and it dawned on me that this was a much
simpler solution.

[I asked him if he minded if I use that for my package](https://x.com/spences10/status/1823695259185857005)
and
[got his blessing](https://x.com/oekazuma/status/1823699517843366233),
so I've just done something very similar with Svead now.

I went about making the changes and started ripping out all of the
types I had for everything in schema.org. Got rid of, a lot of the
checks and all the things that needed to be done to generate the
schema object inside the `Head` component.

## The new SeoConfig

So instead of having this really unwieldy, config object, which you
need to pass into the `Head` component. It's only the SEO meta tags
alone now, which is several props, title, description, URL, anything
else that would be related to, you know, the meta tags, which will be
used for SEO.

Here's an example of what using the Head component looks like now:

```svelte
<script lang="ts">
  import { Head, type SeoConfig } from 'svead'

  const seo_config: SeoConfig = {
    title: 'Welcome to My Site',
    description: 'This is a simple web page example.',
    url: 'https://example.com/welcome',
  }
</script>

<Head {seo_config} />
```

There's additional props listed on the
[Svead site](https://svead.pages.dev/#seoconfig-props) the ones
detailed are required.

## Adding in a SchemaOrg component

So, having JSON-LD helps search engines better understand the content
on your site for SEO purposes and also can enable rich snippets. This
is the only reason I wanted to add it to Svead really was to have the
slick rich search results.

But, you know, I realised it was quite a separate thing. So I split it
out into its own component. This takes in another config object. And
this time, we use
[`schema-dts`](https://github.com/google/schema-dts), (a types package
from Google), where we check the type and the structure of the data,
which gets passed into the `SchemaOrg` component, which leaves a lot
up to the developer on how they want to use it, if at all.

I came to the realization that it would be, very custom situations
for, each person using it. So I thought, give them the tool to do it,
and then, they can they can create their own JSON, object.

## The middle ground

Now at this point, there's not much stopping someone from using the
`svelte:head` component and putting it in there. But I thought this is
a nice middle ground between all of the composable config I had
earlier.

It has type checking in it as well. So it is useful in that regard
where you would create an object. It would be `SchemaOrgProps` type
from the package. When you're creating your object for that, you'll
get your type checking as you would do with TypeScript because, types.
Yay!

Here's an example using it:

```svelte
<script lang="ts">
  import { SchemaOrg, type SchemaOrgProps } from 'svead'

  const schema_org: SchemaOrgProps['schema'] = {
    '@type': 'BlogPosting',
    headline: 'My First Blog Post',
    description: 'This is an example of a blog post using svead.',
    author: {
      '@type': 'Person',
      name: 'John Doe',
    },
    datePublished: '2023-08-22T10:00:00Z',
  }
</script>

<SchemaOrg schema={schema_org} />
```

The two can be used together and I think this gives a bit more
flexibility to the user:

```svelte
<script lang="ts">
  import { page } from '$app/stores'
  import {
    Head,
    SchemaOrg,
    type SeoConfig,
    type SchemaOrgProps,
  } from 'svead'

  const seo_config: SeoConfig = {
    title: 'My Blog Post',
    description: 'This is an example blog post using Svead.',
    url: $page.url.href,
    author_name: 'John Doe',
    site_name: 'My Awesome Blog',
  }

  const schema_org: SchemaOrgProps['schema'] = {
    '@type': 'BlogPosting',
    headline: seo_config.title,
    description: seo_config.description,
    author: {
      '@type': 'Person',
      name: seo_config.author_name,
    },
    datePublished: new Date().toISOString(),
  }
</script>

<Head {seo_config} />
<SchemaOrg schema={schema_org} />

<article>
  <h1>{seo_config.title}</h1>
  <p>{seo_config.description}</p>
  <!-- Rest of your blog post content -->
</article>
```

There's also the option to have multiple JSON-LD sections used. Here's
an example for a "WebPage", with additional nested types like
"BlogPosting" and "BreadcrumbList":

```svelte
<script lang="ts">
  import { page } from '$app/stores'
  import { SchemaOrg, type SchemaOrgProps } from 'svead'

  const get_current_iso_date = () => new Date().toISOString()

  const schema_org: SchemaOrgProps['schema'] = {
    '@type': 'WebPage',
    '@id': $page.url.href,
    url: $page.url.href,
    name: 'How to Use Structured Data in SvelteKit',
    description:
      'Learn how to implement structured data in your SvelteKit project for better SEO.',
    inLanguage: 'en',
    datePublished: get_current_iso_date(),
    dateModified: get_current_iso_date(),
    author: {
      '@type': 'Person',
      name: 'Jane Doe',
    },
    mainEntity: {
      '@type': 'BlogPosting',
      '@id': `${$page.url.href}#article`,
      headline: 'How to Use Structured Data in SvelteKit',
      description:
        'Learn how to implement structured data in your SvelteKit project for better SEO.',
      datePublished: get_current_iso_date(),
      dateModified: get_current_iso_date(),
      author: {
        '@type': 'Person',
        name: 'Jane Doe',
      },
      publisher: {
        '@type': 'Organization',
        name: 'SvelteKit SEO Guide',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': $page.url.href,
      },
      inLanguage: 'en',
    },
  }
</script>

<SchemaOrg schema={schema_org} />

<article>
  <h1>How to Use Structured Data in SvelteKit</h1>
  <p>
    Learn how to implement structured data in your SvelteKit project
    for better SEO.
  </p>
</article>
```

## Wrap-up

That's it, really. Now I did all these changes a couple of weeks ago,
and this is in anticipation for Svelte 5. So at the moment, the most
recent Svead package is behind a `@next` flag. So you can start using
it straight away. I'm quite happy with how it is although I haven't
actually started using it myself in my own projects. That's why I
thought I had to do this blog post because I'm about to start using
it.

You can check out the project over on GitHub:
https://github.com/spences10/svead

## Testing and validation

The actual package itself had a lot of tests added to it, a lot of
examples, which all seemed to work fine from my testing, from putting
it through the schema.org validation and the Google validation tools.
It all seemed to work very well from that.

## Final thoughts and resources

So now it's a case of actually using the tool I've built for myself,
which is why I started this project in the first place. But there's
been so much happening with it that it's stalled. It's been over 2
years in the making now so it's about time I start using it again.

Again, this is me adding my thoughts on this and why I made the
decisions I made, and came around to this whole more, saner approach,
than what I had previously. I'm quite excited to start using it. If
you wanna check out the project, you can see it at
[svead.pages.dev](https://svead.pages.dev), which has got its own site
with examples detailed on there.
