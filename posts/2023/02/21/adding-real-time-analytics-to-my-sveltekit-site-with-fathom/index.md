---
date: 2023-02-21
title: Adding real-time analytics to my SvelteKit site with Fathom
tags: ['analytics', 'svelte', 'sveltekit', 'fathom']
isPrivate: true
---

<script>
  import { DateDistance as DD } from '$lib/components'
</script>

I spent a bit of time the other day looking into the Fathom Analytics
API, this was something I took a look at around a year ago now, but I
didn't really get around to using it.

If you're looking to implement Fathom analytics on your site, I
updated a post <DD date='2023-02-09' /> ago on [Fathom Analytics with
SvelteKit] which details the process.

It also incorporates the Fathom API for real time page views. So if
you're looking to do that, check out that post and [the github repo]!

Well, now I have got round to using it! If you're on this site now and
you're not using something like uBlock Origin, you'll probably see the
live counter of people on this page right now under the tags!

If not you can scroll to the bottom of this page and depending on how
long this post is into the future (I may have scraped it, you know!)
there'll be an analytics section where you can see how may people have
been on this page.

Ok so if you want a privacy focused analytics solution, Fathom, in my
biased opinion, is the best one out there.

Seriously, if you're looking for a privacy first analytics option
check it out! Also while you're at it use my [referral code]! It will
help me out and you're welcome for putting you onto an awesome
product!

FYI Fathom Analytics is a paid service, well worth the money in my
opinion.

If you've not seen any of my previous content check out the
[analytics] tag on the site here! I've written about them a ton in the
past and you can probably tell by now that I really love the product.

Anyways! Preamble over, let's get into how I did it.

## The Fathom API

The Fathom API is still (from what I can tell) early access, so you'll
need to email them to get access to it. You'll be notified when it's
ready with instructions on how to get started.

The [Fathom API documentation] in their own words is **absolutely
gorgeous** and I agree.

Once you get API access you wil be able to go to
[`app.usefathom.com/api`] and generate an API token. There's several
options, **Admin key**, **All sites read only key** and
**Site-specific key**. The site specific and read only key option is
to my mind the most sensible option.

With the options available Fathom have basically opened up the whole
API here so you can create your own analytics reporting dashboard if
you want!

In the following sections now I'll be detailing how to get current
visitors on the site and page analytics.

## Current visitors analytics

## Page analytics

I'll be documenting the implementation for the [SvelteKit and fathom
GitHub project] that is detailed in the [Fathom Analytics with
SvelteKit] post the approach is the same for this site.

If you want to take a look at the code for the project you can check
out the [before] and [after] branches I've created on the repo.

So, I'll make an endpoint to hit the Fathom API, I'll do that by
creating a `+server.js` endpoint to call out to, in my implementation
I called it `analytics.json` and it's located in the `src/routes`
folder.

```bash
# create the folder
mkdir src/routes/analytics.json
# then the server file
touch src/routes/analytics.json/+server.ts
```

The roots folder looks like this now:

```text
├── routes
│   ├── about
│   │   └── +page.svelte
│   ├── analytics.json
│   │   └── +server.js
│   ├── blog
│   │   └── +page.svelte
│   ├── contact
│   │   └── +page.svelte
│   ├── pricing
│   │   └── +page.svelte
│   ├── services
│   │   └── +page.svelte
│   ├── +layout.svelte
│   └── +page.svelte
```

So, now I have a server side endpoint, I need to make a call to the
Fathom API, I'll do that with a HTTP GET method using the SvelteLit
`fetch`.

I'll need an API key to do this, I'll pop on over to
[`app.usefathom.com/api`] click 'Create new', name the key
`ideal-memory-read-only` for the permissions I'll select 'Site
specific key' and select the site to have the key for, (which is
[`ideal-memory.com`]), check the 'Read' access then click 'Save
changes'.

so I'll create a `.env` file in the

Here's the basic outline of the request:

```js
import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { object_to_query_params } from '$lib/utils'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations`,
      {
        headers: headers_auth,
      }
    )

    return json({
      analytics: await res.json(),
    })
  } catch (error) {
    return json({
      error: 'Big oof! Sorry' + error,
      status: 500,
    })
  }
}
```

## Google wants to crawl my API endpoint

This may happen to you or it may not, in my case Google decided it
didn't want to crawl all the blog posts I have made since the start of
the year and instead try to crawl the API endpoints I created.

If this is something you want to check then you can find if Google is
trying to crawl your API endpoints by going to the Google Search
Console selecting 'Pages', then in 'Page indexing' check to see if
there are any entries for 'Crawled - currently not indexed'.

There may be some entries for the endpoint.

To stop this I've added a `Disallow: /analytics.json` line in a
`robots.txt` in the `static` folder.

```text
User-agent: *
Disallow: /analytics.json
```

I made a short post going into more detail for [Robots.txt file for
SvelteKit projects] there's a couple more things in there you may find
useful.

<!-- Links -->

[referral code]: https://usefathom.com/ref/HG492L
[analytics]: https://scottspence.com/tags/analytics
[Fathom API documentation]: https://usefathom.com/api
[Fathom Analytics with SvelteKit]:
  https://scottspence.com/posts/fathom-analytics-with-svelte
[the github repo]: https://github.com/spences10/sveltekit-and-fathom
[`app.usefathom.com/api`]: https://app.usefathom.com/api
[Robots.txt file for SvelteKit projects]:
  https://scottspence.com/posts/robots-txt-file-for-sveltekit-projects
[SvelteKit and fathom GitHub project]:
  https://github.com/spences10/sveltekit-and-fathom
[before]:
  https://github.com/spences10/sveltekit-and-fathom/tree/ref/pre-real-time-analytics-implementation
[after]:
  https://github.com/spences10/sveltekit-and-fathom/tree/feat/add-real-time-analytics
[`ideal-memory.com`]: https://ideal-memory.com
