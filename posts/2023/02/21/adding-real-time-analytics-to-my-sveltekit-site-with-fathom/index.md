---
date: 2023-02-21
title: Adding real-time analytics to my SvelteKit site with Fathom
tags: ['analytics', 'svelte', 'sveltekit', 'fathom']
isPrivate: false
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
long this post is into the future (I may have scrapped it, you know!)
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
out the [before] and [after] branches I've created on the repo, here's
the [diff] so you can take a look at what's changed.

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
{ "analytics": [{ "pageviews": "1162" }] }
```

That's total pageviews for all time for the site, but I want to get
the pageviews for the year, so I'll add in `date_from` and `date_to`
parameters and also a `date_grouping` one. I'll add in the dates from
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
{ "analytics": [{ "pageviews": "647", "date": "2023" }] }
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

Page views grouped by year, pretty neat right!?

## Refine the analytics parameters

Those query parameters in the `fetch` for the analytics is super long
right? What I'll now is, rather than hard code in the parameters I'll
pass an object to the fetch request.

I'll keep the same parameters as before, but I'll create a new
`default_params` object and pass that to the `fetch` request via a
function to build the URL with the query parameters in it.

Let's take a quick look at the function to do that, I'll create
somewhere for it to go first though, I could just co-locate it in the
`analytics.json/+server.ts` file, but I'll create a new folder and
file so it can be reused elsewhere if needed:

```bash
# create a new folder for the utils
mkdir src/lib/utils
# create a new file for the function
touch src/lib/utils/index.ts
```

The function will take in an object and return a query string, joining
the `key` and `value` from the object being passed in with an `=` and
joining all the entries with an `&`:

```ts
export const object_to_query_params = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>
) => {
  const params = Object.entries(obj).map(
    ([key, value]) => `${key}=${value}`
  )
  return '?' + params.join('&')
}
```

Let's do a quick example of how that would work then. So, let's take
the parameters used in the last example and add them to the
`default_params` object:

```ts
const default_params = {
  entity: 'pageview',
  entity_id: PUBLIC_FATHOM_ID,
  aggregates: 'pageviews',
  date_from: '2021-01-01T00:00:00.000Z',
  date_to: '2023-12-31T23:59:59.999Z',
  date_grouping: 'year',
}
```

Passing that into the `object_to_query_params` function will return:

```text
?entity=pageview&entity_id=CDBUGS&aggregates=pageviews&date_from=2021-01-01T00:00:00.000Z&date_to=2023-12-31T23:59:59.999Z&date_grouping=year
```

I'll break that up a bit so it's readable and I hope you get the idea
of what's going on here:

```text
?entity=pageview
&entity_id=CDBUGS
&aggregates=pageviews
&date_from=2021-01-01T00:00:00.000Z
&date_to=2023-12-31T23:59:59.999Z
&date_grouping=year
```

So, I know I've just shifted the hard coded parameters from one place
to another, but these are some base defaults to use and they can be
replaced with variables, I'll come onto that shortly.

For now what I want to do is set some more aggregates, currently
there's just the `pageviews`, I'm going to add `visits`, `uniques`,
`pageviews`, `avg_duration` and `bounce_rate`.

```ts
const default_params = {
  entity: 'pageview',
  entity_id: PUBLIC_FATHOM_ID,
  aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
  date_from: '2021-01-01T00:00:00.000Z',
  date_to: '2023-12-31T23:59:59.999Z',
  date_grouping: 'year',
}
```

Now I refresh the dev server and see what I get from the API now:

```json
{
  "analytics": [
    {
      "visits": "99",
      "uniques": "140",
      "pageviews": "681",
      "avg_duration": "55.5731",
      "bounce_rate": 0.2828282828282828,
      "date": "2023"
    },
    {
      "visits": "145",
      "uniques": "202",
      "pageviews": "492",
      "avg_duration": "30.7709",
      "bounce_rate": 0.1310344827586207,
      "date": "2022"
    },
    {
      "visits": "4",
      "uniques": "5",
      "pageviews": "23",
      "avg_duration": "36.0909",
      "bounce_rate": 0.75,
      "date": "2021"
    }
  ]
}
```

Ok, so, now I've validated the `aggregates`, I'm going to remove the
hardcoded dates and replace them with URL parameters.

In the `+server.ts` `load` function I'll destructure out the `url`
from the `load` function context object and use the `searchParams`
property to get the `date_from` and `date_to` parameters:

```ts
export const GET: RequestHandler = async ({ url }) => {
  const date_from = url.searchParams.get('date_from') ?? null
  const date_to = url.searchParams.get('date_to') ?? null

  const default_params = {
    entity: 'pageview',
    entity_id: PUBLIC_FATHOM_ID,
    aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
    date_grouping: 'year',
  }

  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations${object_to_query_params(
        default_params
      )}`,
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

There's an issue now with this approach as I have to add in some URL
parameters on the local dev server to get the data I want.

From the `localhost:5173/analytics.json` (`:5173` is the default local
development port for Vite) endpoint I can add in the `date_from` and
`date_to` parameters and see what I get:

```text
http://localhost:5174/analytics.json?date_from=2021-01-01T00:00:00.000Z&date_to=2023-12-31T23:59:59.999Z
```

The result is the same as before, so, I know I'm getting the data I
want by passing in the `date_from` and `date_to` parameters.

Now I have to make sure that every call to the API has the date URL
parameters, not very flexible.

So, now instead of having the `date_from` and `date_to` in the
`default_params` I'll create a new object called `date_params`. I'll
conditionally add the parameters if they exist I'll also toss in the
`date_grouping` here.

I found this approach conditionally adding object properties on a
[Stack Overflow] answer, pretty neat!

```ts
const date_params = {
  ...(date_from && { date_from }),
  ...(date_to && { date_to }),
  ...(date_grouping && { date_grouping }),
}
```

Then I can smoosh both the `default_params` and `date_params` together
with the ES6 spread syntax.

```ts
const params = { ...default_params, ...date_params }
```

Then pass the `params` into the `object_to_query_params` function.

So now if I make a call to the `/analytics.json` endpoint without any
parameters I get the lump total again:

```json
{
  "analytics": [
    {
      "visits": "470",
      "uniques": "453",
      "pageviews": "2328",
      "avg_duration": "47.8992",
      "bounce_rate": 0.265824915584089
    }
  ]
}
```

Cool, cool! Now if I don't add in any URL parameters I get the total
data, if I add in the `date_from` and `date_to` parameters I get the
data I want.

Here's what the full `+server.ts` file for `/analytics.json` looks
like now:

```ts
import { FATHOM_API_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import { object_to_query_params } from '$lib/utils'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  const date_from = url.searchParams.get('date_from') ?? null
  const date_to = url.searchParams.get('date_to') ?? null
  const date_grouping = url.searchParams.get('date_grouping') ?? null

  const date_params = {
    ...(date_from && { date_from }),
    ...(date_to && { date_to }),
    ...(date_grouping && { date_grouping }),
  }

  const default_params = {
    entity: 'pageview',
    entity_id: PUBLIC_FATHOM_ID,
    aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
  }

  const params = { ...default_params, ...date_params }

  try {
    const headers_auth = new Headers()
    headers_auth.append(`Authorization`, `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/aggregations${object_to_query_params(
        params
      )}`,
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

Ok, now in the next section I'll add in page paths so that I can get
detailed information on individual pages.

## Getting specific page data

Up until now there's only been information on the whole site, now I
want to get specific page analytics.

I can do this by adding in some filters to the `default_params`
object, remember this is hardcoded, you can pass whatever you want as
query parameters to the endpoint, I just find that this is a nice set
of defaults to use.

For these filters I'll need to specify a `field_grouping` for the
`pathname` which will be the page slug. Then in the `filters` I'll
specify the `property` to filter on as `pathname` with the
`operator: is` and the `value` as the `pathname` I'll pass in.

The `default_params` object will looks like this now:

```ts
const default_params = {
  entity: 'pageview',
  entity_id: PUBLIC_FATHOM_ID,
  aggregates: 'visits,uniques,pageviews,avg_duration,bounce_rate',
  field_grouping: 'pathname',
  filters: `[{"property": "pathname","operator": "is","value": "${pathname}"}]`,
}
```

I'll need to pass in the `pathname` as a parameter to the endpoint, so
in the `GET` function I'll add in a variable to get the `pathname`
from the URL:

```ts
const pathname = url.searchParams.get('pathname') ?? '/'
```

Aight! Sweet! I'm now set up to pass parameters to the endpoint.

So, now, for each page load I want to pass in the date range I want
for the page analytics and the page path.

I'm going to add daily, month to date and year to date analytics for
the pages.

As none of the pages in this project are dynamically generated I'll
use a `+page.server.ts` file for each route to request the data.

If the pages were dynamically generated this could be done in one
file. As they're not, I'll create a utility function to create the
query parameters passing in the `pathname` parameter.

So, in the `page_analytics` function I'm about to create, I'll want to
get the dates and times for the `day_start`, `day_end`, `month_start`,
`month_end`, `year_start` and `year_end` variables.

Rather than faffing around with the `Date` object I'm going to use
`date-fns` this has all the utility functions I need to do this.

```bash
pnpm i -D date-fns
```

In the `src/lib/utils/index.ts` where I'll create the `page_analytics`
function I'll import the `date-fns` functions:

```ts
import {
  format,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns'
```

Then I'll create the `page_analytics` function, this will need to take
in the `base_path` for the endpoint call that includes the page slug,
so for the about page `analytics.json?pathname=/about`. I'll also pass
the `fetch` from the `+page.server.ts` to call the endpoint. I'll come
onto the `+page.server.ts` files in a bit.

For the Svelte fetch being passed I've used the VS Code helper to
infer the type:

```ts
export const page_analytics = async (
  base_path: string,
  fetch: {
    (
      input: URL | RequestInfo,
      init?: RequestInit | undefined
    ): Promise<Response>
    (
      input: URL | RequestInfo,
      init?: RequestInit | undefined
    ): Promise<Response>
    (arg0: string): any
  }
) => {}
```

The add in the date variables:

```ts
const day_start = startOfDay(new Date()).toISOString()
const day_end = endOfDay(new Date()).toISOString()

const month_start = startOfMonth(new Date()).toISOString()
const month_end = endOfMonth(new Date()).toISOString()

const year_start = startOfYear(new Date()).toISOString()
const year_end = endOfYear(new Date()).toISOString()
```

Then create a functions to `fetch_daily_visits`,
`fetch_monthly_visits` and `fetch_yearly_visits` I'll show the example
for `fetch_daily_visits` and return `daily_visits`.

```ts
const fetch_daily_visits = async () => {
  const res = await fetch(
    `${base_path}&date_from=${day_start}&date_to=${day_end}`
  )
  const { analytics } = await res.json()
  return analytics
}

return {
  daily_visits: fetch_daily_visits(),
}
```

Here's what the full `page_analytics` function looks like:

<Details buttonText="page_analytics" styles="lowercase">

```ts
export const page_analytics = async (
  base_path: string,
  fetch: {
    (
      input: URL | RequestInfo,
      init?: RequestInit | undefined
    ): Promise<Response>
    (
      input: URL | RequestInfo,
      init?: RequestInit | undefined
    ): Promise<Response>
    (arg0: string): any
  }
) => {
  const day_start = startOfDay(new Date()).toISOString()
  const day_end = endOfDay(new Date()).toISOString()

  const month_start = startOfMonth(new Date()).toISOString()
  const month_end = endOfMonth(new Date()).toISOString()

  const year_start = startOfYear(new Date()).toISOString()
  const year_end = endOfYear(new Date()).toISOString()

  // get daily visits
  const fetch_daily_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${day_start}&date_to=${day_end}`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get monthly visits
  const fetch_monthly_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${month_start}&date_to=${month_end}&date_grouping=month`
    )
    const { analytics } = await res.json()
    return analytics
  }
  // get yearly visits
  const fetch_yearly_visits = async () => {
    const res = await fetch(
      `${base_path}&date_from=${year_start}&date_to=${year_end}&date_grouping=year`
    )
    const { analytics } = await res.json()
    return analytics
  }

  return {
    daily_visits: fetch_daily_visits(),
    monthly_visits: fetch_monthly_visits(),
    yearly_visits: fetch_yearly_visits(),
  }
}
```

</Details>

I can now create a `+page.server.ts` file for each page and call the
`page_analytics` function.

Create the `+page.server.ts` file for the about page:

```bash
touch src/routes/about/+page.server.ts
```

Then add in a `load` function and call the `page_analytics` function:

```ts
import { page_analytics } from '$lib/utils'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ fetch }) => {
  const base_path = `analytics.json?pathname=/about`

  let { daily_visits, monthly_visits, yearly_visits } =
    await page_analytics(base_path, fetch)

  return {
    daily_visits,
    monthly_visits,
    yearly_visits,
  }
}
```

Now to test this out I'll add the `daily_visits` to the about page,
I'll need to accept the `data` prop then I can validate the data by
dumping it out into a `<pre>` tag:

```svelte
<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>

<svelte:head>
  <title>SvelteKit with Fathom | About</title>
</svelte:head>

<section
  class="prose-xl prose-h1:text-secondary prose-a:link-primary"
>
  <h1>About</h1>

  <p>This site was built to made to showcase Fathom Analytics.</p>
</section>
```

Looking at the about page I get the pre tag with the data:

```json
{
  "visitors": {
    "total": 1,
    "content": [
      {
        "hostname": "http://localhost",
        "pathname": "/about",
        "total": "1"
      }
    ],
    "referrers": []
  },
  "daily_visits": [
    {
      "visits": "5",
      "uniques": "3",
      "pageviews": "132",
      "avg_duration": "66.4521",
      "bounce_rate": 0,
      "pathname": "/about"
    }
  ],
  "monthly_visits": [
    {
      "visits": "7",
      "uniques": "16",
      "pageviews": "192",
      "avg_duration": "46.9545",
      "bounce_rate": 0.14285714285714285,
      "date": "2023-02",
      "pathname": "/about"
    }
  ],
  "yearly_visits": [
    {
      "visits": "7",
      "uniques": "18",
      "pageviews": "194",
      "avg_duration": "46.1339",
      "bounce_rate": 0.14285714285714285,
      "date": "2023",
      "pathname": "/about"
    }
  ]
}
```

Success!!

Yes the `visitors` data is also in the page `data` variable, this is
available as the layout file is a parent file to the page file.

I could be more specific and only destructure the data I need, but
this is fine for now.

Ok, that's it! All I need to do now is display the data on the page,
I'll use the daisyUI stats component to do this.

I'll create a component for the stats:

```bash
touch src/lib/components/analytics-card.svelte
```

Then in the component I'll need to accept the analytics data as
`page_analytics` and use the daisyUI classes to style the stats:

```svelte
<script lang="ts">
  export let page_analytics: {
    date: string
    visits: number
    uniques: number
    pageviews: number
  }
</script>

<div
  class="stats stats-vertical mb-8 w-full border border-secondary shadow-lg md:stats-horizontal"
>
  <div class="stat">
    <div class="stat-title">Entries</div>
    <div class="stat-value text-2xl">
      {page_analytics?.visits}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Visitors</div>
    <div class="stat-value text-2xl">
      {page_analytics?.uniques}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Views</div>
    <div class="stat-value text-2xl">
      {page_analytics?.pageviews}
    </div>
  </div>
</div>
```

Then in the about page I'll import the component and pass in the data
for each of the stats:

```svelte
<script lang="ts">
  import { AnalyticsCard } from '$lib/components'
  import type { PageData } from './$types'

  export let data: PageData
</script>

<svelte:head>
  <title>SvelteKit with Fathom | About</title>
</svelte:head>

<section
  class="prose-xl prose-h1:text-secondary prose-a:link-primary"
>
  <h1>About</h1>

  <p>This site was built to made to showcase Fathom Analytics.</p>

  <p>Live Analytics for daily visits.</p>
  <AnalyticsCard page_analytics={data?.daily_visits[0]} />
  <p>Live Analytics for monthly visits.</p>
  <AnalyticsCard page_analytics={data?.monthly_visits[0]} />
  <p>Live Analytics for yearly visits.</p>
  <AnalyticsCard page_analytics={data?.yearly_visits[0]} />

</section>
```

I'll repeat the same process for the other pages in the project, I'm
not going to be posting any more code walls as it's the same process
for each page.

Done!

That's it I implemented Fathom Analytics in a SvelteKit project for
live visitors and individual page stats.

## Google wants to crawl my API endpoint

One last thing, not related to implementing the analytics, this may
happen to you or it may not. In my case however Google decided it
didn't want to crawl all the blog posts I have made since the start of
the year and instead wanted to crawl the API endpoints I created.

If this is something you want to check for yourself then you can find
if Google is trying to crawl your API endpoints by going to the Google
Search Console selecting 'Pages', then in 'Page indexing' check to see
if there are any entries for 'Crawled - currently not indexed'.

There may be some entries for the endpoints.

To stop this I've added a `Disallow:` line for the endpoints in a
`robots.txt` in the `static` folder of my SvelteKit project.

```text
User-agent: *
Disallow: /analytics.json
Disallow: /current-visitors.json
```

I made a short post going into more detail for [Robots.txt file for
SvelteKit projects] there's a couple more things in there you may find
useful.

## Conclusion

I've implements Fathom Analytics on a pre-existing project using the
Fathom Analytics API.

This means I can get real-time page views and current visitors the
website.

The Fathom API is still in early access, contact them to get access to
it.

This was just my implementation I hacked on over a weekend. The Fathom
API could allow you create your own fully functional analytics
reporting dashboard.

Finally, to prevent Google from crawling API endpoints, I added in a
`Disallow` line in a `robots.txt`.

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
[diff]:
  https://github.com/spences10/sveltekit-and-fathom/pull/160/files
[`ideal-memory.com`]: https://ideal-memory.com
[SvelteKit Environment Variables with the SvelteKit $env Module]:
  https://scottspence.com/posts/sveltekit-environment-variables-with-the-sveltekit-env-module
[Stack Overflow]: https://stackoverflow.com/a/51200448
