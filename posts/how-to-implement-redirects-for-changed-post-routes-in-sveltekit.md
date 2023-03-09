---
date: 2023-02-06
title: How to Implement Redirects for Changed Post Routes in Sveltekit
tags: ['sveltekit', 'seo', 'guide', 'how-to']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
  import { DateDistance } from '$lib/components'
</script>

In this post I'll be detailing how I implemented redirects for changed
post routes in SvelteKit. I initially did this back in the Summer of
2021 but with the SvelteKit v1 release some things have changed.

For the **Tl;Dr** skip to the [solution](#the-new-solution).

This site is <DateDistance date='2021-04-06' /> old now! Before that I
was using a URL path that directly mapped onto where the posts lived
in the folder structure of the project. I used to have the routes on
posts as `/:year/:month/:day/:slug`. With the new site I wanted to map
them to `/posts/:slug`.

The old structure (to my mind) made perfect sense as it was easy to
understand the age of the post from looking at the URL. However, now I
clearly mark the date on the post. I even give a little informational
banner at the top of the post to let you know the age of the post if
it is over a year old.

From what I can glean, the path structure of the URL is not a ranking
factor for SEO, but it is a factor for user experience. There was also
technical reasons for the change, but that's another post.

Anyway, preamble over let's get into how I did it.

## The Problem

I went from `/:year/:month/:day/:slug` to `/posts/:slug` and I wanted
to redirect the old URLs to the new ones.

<!-- cSpell:ignore mydomain -->

I asked this question a while back on Twitter, which was **"I want to
do a load of redirects (~130) using SvelteKit, anyone have any
examples of redirecting from:
`mydomain.tld/2021/06/23/some-post-title/index.mdx` to:
`mydomain.tld/some-post-title.svx`"**

<Tweet tweetLink="spences10/status/1407743903361646596" />

The absolute legend that is [Rodney] suggested that I use a dynamic
route for the old URLs and then redirect to the new ones.

The response was: **"The idea is you create a file there and that file
only contains a redirect to `example.com/[slug]`, year, month, day
parameters are available but you don't have to use them."**

<Tweet tweetLink="askRodney/status/1408474251292725248" />

## The old solution

Please bear in mind that the tweet from Rodney was from pre SvelteKit
v1 which was <DateDistance date='2021-06-05' /> ago now and the
routing wasn't thoroughly worked out then.

If the tweet/and Twitter is still around you'll see in the image that
it's using the `<script context="module">` method where SvelteKit used
to do the data loading in one file.

```svelte
<script context="module">
  export async function load({ page }) {
    const { slug } = page.params
    return {
      status: 301,
      redirect: `/posts/${slug}`,
    }
  }
</script>
```

With the SvelteKit v1 changes which happened I moved the `load`
function out of the `+page.svelte` file into a `+page.js` file.

So, the solution was to have the load function in a `+page.js` take in
the `params` and then redirect to the new URL.

```js
import { redirect } from '@sveltejs/kit'

export const load = async ({ params }) => {
  const { slug } = params
  throw redirect(301, `/posts/${slug}`)
}
```

The filing structure needed to take in the year, month, day and the
slug of the URL, so I had a dynamic route for each of those.

This is effectively a wildcard route, but it's taking anything that
has a `/something/something/something/slug/` format.

So, If I enter the following URLs they both redirect to the slug at
the end.

Examples:

```html
<!-- these aren't valid dates -->
scottspence.com/2028/90/90/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
<!-- doesn't even need number in there -->
scottspence.com/banana/soup/mmmmm/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
```

Neither of those made much sense, what's happening is the dynamic
routes (denoted with the square boys `[yyyy]`) it's just getting
through that folder structure.

As long as the `[slug]` matches a valid slug it will redirect.

The above URLs will redirect to the following URL.

```text
https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
```

I can add anything into those placeholders really, it doesn't matter.
What does matter is that I have a fair few posts out there which have
the old URL structure.

Here's the folder structure as I refactored it to accommodate the
SvelteKit v1 changes.

```text
├── src
│   └── routes
│       ├── [yyyy]
│       │   └── [mm]
│       │       └── [dd]
│       │           └── [slug]
│       │               ├── +page.js
│       │               └── +page.svelte
│       ├── +page.js
│       ├── +page.svelte
```

There didn't need to be anything in the `+page.svelte` file as it was
just a redirect. This was working a charm, until I implemented [real
time analytics] to the site.

This is a bit of an aside as to why it wasn't working and a longer
post so, let's just say that it did inform me that I wasn't handling
the redirects correctly. 😅

What I actually needed to do was intercept the request on the server
rather than on the page load, which is what the `+page.js` file was
doing.

## The new solution

With the incoming request `/posts/:year/:month/:day/:slug` I need to
redirect to `/posts/:slug` on the server.

Here's what the folder structure looks like now.

```text
├── src
│   └── routes
│       ├── [yyyy]
│       │   └── [mm]
│       │       └── [dd]
│       │           └── [slug]
│       │               └── +server.js
│       ├── +page.js
│       ├── +page.svelte
```

The folder structure is still the same, but, instead of having a
`+page.js` with a `load` function I'm using a `+server.js` file with a
`GET` HTTP method to pass the `slug` from the `params` into a
redirect.

```js
import { redirect } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ params }) => {
  const { slug } = params
  throw redirect(301, `/posts/${slug}`)
}
```

## Conclusion

If you have changed your URL structure and you want to redirect the
old URLs to the new ones, then this an approach you can take.

I hope this helps someone else out there who is trying to do the same
thing. I'm sure there are other ways to do this, but this is the way
that I've done it.

<!-- Links -->

[Rodney]: https://twitter.com/askRodney
[real time analytics]:
  https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
