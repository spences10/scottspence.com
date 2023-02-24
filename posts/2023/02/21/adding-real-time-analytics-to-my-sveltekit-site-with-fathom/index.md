---
date: 2023-02-21
title: Adding real-time analytics to my SvelteKit site with Fathom
tags: ['analytics', 'svelte', 'sveltekit', 'fathom']
isPrivate: true
---

<script>
  import { DateDistance as DD, Details } from '$lib/components'
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

## Implementation

I'll be documenting the implementation for the [SvelteKit and fathom
GitHub project] that is detailed in the [Fathom Analytics with
SvelteKit] post, the approach is the same for this site.

If you want to take a look at the code for the project you can check
out the [before] and [after] branches I've created on the repo.

In the following sections I'll be detailing how to get current
visitors on the site and individual page analytics.

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

With all the options available Fathom have basically opened up the
whole API here so you can create your own analytics reporting
dashboard if you want!

## Fathom API key

Before I start trying to access the API I'll need to generate an API
key. To do this, I'll pop on over to [`app.usefathom.com/api`] click
'Create new', name the key `ideal-memory-read-only` for the
permissions I'll select 'Site specific key' and select the site to
have the key for, (which is [`ideal-memory.com`]), check the 'Read'
access then click 'Save changes'.

I already have a pre-existing `.env` file so I'll add an entry to it
for the `FATHOM_API_KEY` I just generated.

## Current visitors analytics

To get the current visitors to a site I'll make an endpoint to hit the
Fathom API, I'll do that by creating a `+server.js` endpoint to call
out to, in my implementation I'll call it `current-visitors.json` and
it's located in the `src/routes` folder.

So, I'll create the folder and the server file from the terminal.

```bash
# create the folder
mkdir src/routes/current-visitors.json
# then the server file
touch src/routes/current-visitors.json/+server.ts
```

The `routes` folder looks like this now:

```text
├── routes
│   ├── about
│   │   └── +page.svelte
│   ├── blog
│   │   └── +page.svelte
│   ├── contact
│   │   └── +page.svelte
│   ├── current-visitors.json
│   │   └── +server.js
│   ├── pricing
│   │   └── +page.svelte
│   ├── services
│   │   └── +page.svelte
│   ├── +layout.svelte
│   └── +page.svelte
```

In the `+server.ts` file I'll create a `GET` request handler to call
the Fathom API.

```ts
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  return json({
    visitors: 0,
  })
}
```

This is the basic outline of the `GET` request and I'm using the
SvelteKit `json` helper to return the data as JSON.

If I spin up the dev server and go to `/current-visitors.json` on
`localhost` I'll see the following JSON response.

```json
{ "visitors": 0 }
```

This is eventually going to return the current visitors to the site.
If we take a look at the [Fathom API documentation] we can see that
the `current_visitors` endpoint takes the `site_id` as a query
parameter, here's the `curl` request to get it from the documentation.

```bash
curl https://api.usefathom.com/v1/current_visitors \/
-H "Authorization: Bearer API_TOKEN_HERE" \/
-d site_id=ABCDEFG \/
-G
```

So, I'll make a fetch request to the Fathom API and pass in the
`site_id` as a query parameter along with the `Authorization` header,
both of which are from the `.env` file. One is private
`FATHOM_API_KEY` the other is public `PUBLIC_FATHOM_ID` both using the
`$env` module.

You can read up more about using the `$env` module with the [SvelteKit
Environment Variables with the SvelteKit $env Module] post I updated a
while back.

I'll wrap the fetch request with the `Authorization` header in a try
catch block and return the data from the API as JSON.

```ts
import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/current_visitors?site_id=${PUBLIC_FATHOM_ID}&detailed=true`,
      {
        headers: headers_auth,
      }
    )

    let data = await res.json()

    return json({
      visitors: data,
    })
  } catch (error) {
    return json({
      error: `Error: ${error}`,
      status: 500,
    })
  }
}
```

Sweet! Now I can see the current visitors to the site. To test it
quickly I'll go to `ideal-memory.com` and select the `contact` page.
Over on `localhost` I'll refresh the `current-visitors.json` endpoint
and I get the following JSON response.

```json
{
  "visitors": {
    "total": 1,
    "content": [
      {
        "hostname": "https://www.ideal-memory.com",
        "pathname": "/contact",
        "total": "1"
      }
    ],
    "referrers": []
  }
}
```

Aight! I can now use this in the project somewhere to show the current
visitors to the site.

The `ideal-memory.com` site is a bit basic, so rather than create a
footer and place the current visitors there I'll add it to the navbar
so it's in plain sight of visitors.

To do that I'll first need to call the `current-visitors.json` API
endpoint from a `+layout.server.ts` file and pass the data from that
to the `nav` component.

Create the `+layout.server.ts` file:

```bash
touch src/routes/+layout.server.ts
```

Then in the `+layout.server.ts` file I'll create a `load` function to
call the `current-visitors.json` API endpoint and return the
`visitors`.

```ts
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ fetch }) => {
  const fetch_visitors = async () => {
    const res = await fetch(`../current-visitors.json`)
    const { visitors } = await res.json()
    return visitors
  }

  return {
    visitors: fetch_visitors(),
  }
}
```

The data returned from the `+layout.server.ts`, `load` function is
then available to child `+layout.svelte` components.

In the `+layout.svelte` file I can accept the `visitors` data:

```ts
import type { PageData } from './$types'

export let data: PageData
```

Then pass that to the `nav` component.

```svelte
<Nav visitors={data?.visitors.total} />
```

I've hidden the full file contents behind some buttons, you can click
on them to check out how the files look.

<Details buttonText="+layout.svelte" styles="lowercase">

```svelte
<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import {
    PUBLIC_FATHOM_ID,
    PUBLIC_FATHOM_URL,
  } from '$env/static/public'
  import Nav from '$lib/components/nav.svelte'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import '../app.css'
  import type { PageData } from './$types'

  export let data: PageData

  onMount(async () => {
    Fathom.load(PUBLIC_FATHOM_ID, {
      url: PUBLIC_FATHOM_URL,
    })
  })

  $: $page.url.pathname, browser && Fathom.trackPageview()
</script>

<Nav visitors={data?.visitors.total} />
<main class="container mx-auto mb-20 max-w-3xl px-4">
  <slot />
</main>
```

</Details>

Add a visitors prop to the nav component:

```ts
export let visitors: number
```

Which I can use in the navbar end:

```svelte
<div class="navbar-end">
  <p
    class="text-sm font-semibold cursor-pointer rounded-xl bg-secondary px-2 tracking-wide text-secondary-content"
  >
    {visitors} Live Visitors
  </p>
</div>
```

This is what the navbar looks like now:

<Details buttonText="nav.svelte" styles="lowercase">

```svelte
<script lang="ts">
  import { trackGoal } from 'fathom-client'

  let links = [
    {
      href: '/pricing',
      text: 'Pricing',
    },
    {
      href: '/contact',
      text: 'Contact Us',
    },
    {
      href: '/about',
      text: 'About',
    },
    {
      href: '/blog',
      text: 'Blog',
    },
  ]

  export let visitors: number
</script>

<div class="navbar mb-10 bg-neutral text-neutral-content shadow-lg">
  <div class="navbar-start mx-2 px-2">
    <a href="/" on:click={() => trackGoal(`KWOYX0PK`, 0)}>
      <span class="text-lg font-bold">SvelteKit and Fathom</span>
    </a>
  </div>
  <div class="navbar-center mx-2 hidden px-2 lg:flex">
    <div class="flex items-stretch">
      {#each links as { href, text }}
        <a {href} class="btn-ghost rounded-btn btn-sm btn">
          {text}
        </a>
      {/each}
    </div>
  </div>
  <div class="navbar-end">
    <p
      class="text-sm font-semibold cursor-pointer rounded-xl bg-secondary px-2 tracking-wide text-secondary-content"
    >
      {visitors} Live Visitors
    </p>
  </div>
</div>
```

</Details>

That's it for this section. Now onto getting the page analytics.

## Page analytics

Ok, so in this section things will get a bit more intense! Why?
Because there's a lot of parameters that need passing to the Fathom
API to get the `aggregations` for the page analytics.

So, let's take this a step at a time.

As before, I'll make an endpoint this time for `analytics.json` and
create a `+server.js` file for the API call.

```bash
# create the folder
mkdir src/routes/analytics.json
# then the server file
touch src/routes/analytics.json/+server.ts
```

Now this is how the `routes` folder looks:

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
│   ├── current-visitors.json
│   │   └── +server.js
│   ├── pricing
│   │   └── +page.svelte
│   ├── services
│   │   └── +page.svelte
│   ├── +layout.svelte
│   └── +page.svelte
```

Same again, I'll make a simple `GET` request handler in the
`+server.ts` file and return `analytics`.

```js
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  return json({
    analytics: 0,
  })
}
```

As before I can visit the endpoint to validate it's working, I'll go
to the `localhost` on my dev server for `/analytics.json` and validate
it's working:

```json
{ "analytics": 0 }
```

Cool, cool, cool, now, with the easy part out of the way it's time to
take a look at the Fathom API docs!

Let's take a look at the most basic request to the API for pageviews,
here's the `curl` request in the Fathom docs:

```bash
curl https://api.usefathom.com/v1/aggregations \/
  -H "Authorization: Bearer API_TOKEN_HERE" \/
  -d entity="pageview" \/
  -d entity_id="CDBUGS" \/
  -d aggregates="pageviews" \/
  -G
```

You'll notice this time there's no `site_id` and instead this time
it's an `entity_id`.

I'll fold that into the `+server.ts` file now adding in the `entity`,
`entity_id` and `aggregates` values from the `curl` request along with
the `PUBLIC_FATHOM_ID` to identify the site:

```ts
import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations?entity=pageview&entity_id=${PUBLIC_FATHOM_ID}&aggregates=pageviews`,
      {
        headers: headers_auth,
      }
    )

    let data = await res.json()

    return json({
      analytics: data,
    })
  } catch (error) {
    return json({
      error: `Error: ${error}`,
      status: 500,
    })
  }
}
```

That gives me a response of:

```json
{ "analytics": [{ "pageviews": "1382" }] }
```

That's total pageviews for all time for the site, but I want to get
the pageviews for the year, so I'll add in `date_from` and `date_to`
parameters and also a `date_grouping` one I'll add in the dates from
the start of the year to the end of the year and have the grouping as
`year`:

```ts
import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations?entity=pageview&entity_id=${PUBLIC_FATHOM_ID}&aggregates=pageviews&date_from=2023-01-01T00:00:00.000Z&date_to=2023-12-31T23:59:59.999Z&date_grouping=year`,
      {
        headers: headers_auth,
      }
    )

    let data = await res.json()

    return json({
      analytics: data,
    })
  } catch (error) {
    return json({
      error: `Error: ${error}`,
      status: 500,
    })
  }
}
```

Refreshing the endpoint on the dev server gives me:

```json
{ "analytics": [{ "pageviews": "641", "date": "2023" }] }
```

So now, if I change the start year from `2023` to `2021` I get:

```json
{
  "analytics": [
    { "pageviews": "647", "date": "2023" },
    { "pageviews": "492", "date": "2022" },
    { "pageviews": "23", "date": "2021" }
  ]
}
```

Pretty neat right!?

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
[SvelteKit Environment Variables with the SvelteKit $env Module]:
  https://scottspence.com/posts/sveltekit-environment-variables-with-the-sveltekit-env-module
