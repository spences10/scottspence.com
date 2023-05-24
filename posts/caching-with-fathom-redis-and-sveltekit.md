---
date: 2023-03-17
title: Caching with Fathom, Redis, and SvelteKit
tags: ['analytics', 'sveltekit', 'fathom', 'redis', 'caching']
isPrivate: false
---

<script>
  import { Tweet } from 'sveltekit-embed'
  import { Details } from '$lib/components'
</script>

I had a bit of a surprise land in my inbox at the start of the month
from my analytics provider Fathom, the subject line **"You've been
quite popular"**.

Not the good type of surprise though! 😅

On opening the email I discovered that I'd exceeded the limit on my
current pricing plan, by a factor of 5. With the base plan you get
with Fathom (for $140 a year) you get 100,000 pageviews per month.
This also includes API calls I'd hit over 500,000.

So I go into full panic mode and remove all of the calls to the the
Fathom API which I documented in the [Adding real-time analytics to my
SvelteKit site with Fathom] post at the end of Feb.

I reached out to the Fathom support team and they were awesome and I
didn't need to move up to the $540 annual plan. I did offer to pay the
difference but they said that wasn't necessary. Thanks Ash!

<Tweet tweetLink="spences10/status/1632735190266130433" />

Preamble over, let's get into the caching.

## Scene setting

This example is a enhancement to the already existing
[sveltekit-and-fathom] project over on GitHub you can check out the
code over there.

The project gets live visitors and page analytics from the Fathom
Analytics API, they're in two endpoints on the project
`/current-visitors.json` and `/analytics.json`.

All the changes for this post are in the [PR] and I'll be going over
the changes in this post.

For more information on the project for using Fathom and SvelteKit
check out the following:

- [Fathom Analytics with SvelteKit]
- [Adding real-time analytics to my SvelteKit site with Fathom]

So, this is taking into account the previous posts listed above.

I have an existing SvelteKit project with Fathom Analytics configured
and live analytics already. Now the purpose of this post is to
implement caching for the analytics and live visitors data.

This is the third instalment and an addition to the previous two
posts. If you just want to implement caching into a SvelteKit project
then this will be useful for you as well.

## Thanks!

First up, before we get into the details I want to thank [Geoff Rich]
for his post on the Upstash blog for [Building SvelteKit Applications
with Serverless Redis] Geoff is a great blogger who's site a get a lot
of value out from.

If you haven't checked out his site then I highly recommend you do so!

## Get started

Before I get started I should mention the prerequisites needed:

- Fathom Analytics account with API access
- SvelteKit project with Fathom Analytics configured
- Redis instance, I'm using upstash

The only thing I'll be covering in this post will be configuring
Redis, the rest of the setup is covered in the previous posts.

From the Upstash console I'll create a database, give it a name and
keep the rest of the default options, for the region it's advised that
you chose the region closest to where your application is. I'm using
Vercel so to find where the build was I went into the deployment build
logs and found the region from there.

Once the database is created I'll need to get the connection string,
at the time of writing this I can get the connection string from the
details tab. It looks a bit like this:

```bash
redis://default:...
```

Copy that, add it to my `.env` file with a variable name of
`REDIS_CONNECTION` and I'm good to go.

The data I'll be caching will be coming from the two endpoints
`/current-visitors.json` and `/analytics.json` I mentioned earlier.

I'll start with current visitors.

## Current visitors

In the `src/routes/current-visitors.json/+server.ts` file as it was
before this refactor did a straight up call to the Fathom API to get
the current visitors data. This is how it looked:

```ts
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

To start caching the `visitors` data I'll need to add a Redis client
to the project. I'm using [ioredis] as this is the one used in Geoff's
guide! 😅

```bash
pnpm i -D ioredis
```

The path for the Fathom Analytics API response for visitors isn't
going to change so for the key value pair on the visitors data I'll
add a `VISITORS_KEY` environment variable.

This is just a unique identifier for the visitors data, it can be
whatever you like. I used a GUID generator to create a random string
and added that to my `.env` file.

I'll create a new file in the `src/lib` folder called `redis.ts` and
add the following code:

```ts
import { REDIS_CONNECTION, VISITORS_KEY } from '$env/static/private'
import Redis from 'ioredis'

export function get_current_visitors(): string {
  return `visitors:${VISITORS_KEY}`
}

// I'll be needing this later
export function get_page_analytics(slug: string): string {
  return `slug:${slug}`
}

export default REDIS_CONNECTION
  ? new Redis(REDIS_CONNECTION)
  : new Redis()
```

I'm defining a couple of functions to help access the data from the
Redis instance.

The last part creates a new instance of the Redis client using either
the `REDIS_CONNECTION` (if available) or the default configuration.

A quick rundown of what's happening in this file:

- I'm importing the environment variables I need
- I'm importing the Redis client
- I'm creating a function to get the visitors key
- I'm creating a function to get the page analytics key (I'll be using
  this later)
- I'm creating a new Redis instance

I'll need to update the `src/routes/current-visitors.json/+server.ts`
file now to use the Redis client.

I'll add in some additional functions, first I'll need to check if the
data is in the cache with `get_visitors_from_cache`, if it is then
I'll return that, if not then I'll make the call to the Fathom API
with `get_visitors_from_api`, cache the response (in Redis) then
return the data.

```ts
import { FATHOM_API_KEY, VISITORS_KEY } from '$env/static/private'
import { PUBLIC_FATHOM_ID } from '$env/static/public'
import redis, { get_current_visitors } from '$lib/redis'
import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const cached_visitors = await get_visitors_from_cache()
  if (cached_visitors) {
    return json({ visitors: cached_visitors })
  }

  const visitors = await get_visitors_from_api()
  return json({ visitors })
}

const get_visitors_from_api = async () => {
  try {
    const headers_auth = new Headers()
    headers_auth.append('Authorization', `Bearer ${FATHOM_API_KEY}`)
    const res = await fetch(
      `https://api.usefathom.com/v1/current_visitors?site_id=${PUBLIC_FATHOM_ID}&detailed=true`,
      {
        headers: headers_auth,
      }
    )

    if (res.ok) {
      const data = await res.json()
      await cache_fathom_response(VISITORS_KEY, { visitors: data })
      return data
    }
  } catch (error) {
    console.error(`Error fetching visitors from API: ${error}`)
  }
  return null
}

const get_visitors_from_cache = async () => {
  try {
    const cached = await redis.get(get_current_visitors())
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error(`Error fetching visitors from cache: ${e}`)
  }
  return null
}

const cache_fathom_response = async (
  id: string = VISITORS_KEY,
  visitors: any
) => {
  try {
    const cache = { visitors }
    await redis.set(id, JSON.stringify(cache), 'EX', 15 * 60)
  } catch (e) {
    console.error(`Error caching Fathom response: ${e}`)
  }
}
```

I'll summarise what the functions are doing:

- `get_visitors_from_cache` checks if the data is in the cache and
  returns it if it is.
- `cache_fathom_response` caches the data in Redis.
- `get_visitors_from_api` makes the call to the Fathom API and caches
  the data in Redis before returning the data for use in the `GET`
  handler.

## Page analytics

Before I added in caching the `src/lib/utils/index.ts` file looked
like this, it's behind the `index.ts` button here:

<Details buttonText="index.ts" styles="lowercase">

```ts
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

export const object_to_query_params = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>
) => {
  const params = Object.entries(obj).map(
    ([key, value]) => `${key}=${value}`
  )
  return `?${params.join('&')}`
}

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

One dirty great function to get the daily, monthly and yearly visits.

I took a similar approach with this file as with the `GET` handler.
Added in a function to first check the cache
`get_analytics_from_cache`, if there's no cached data, go off and
request the data from the Fathom API then cache the data with
`cache_analytics_response`.

I'll detail them individually here, then put the whole file behind the
`index.ts` button again.

Get analytics from cache:

```ts
const get_analytics_from_cache = async (cache_key: string) => {
  try {
    const cached = await redis.get(cache_key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error(`Error fetching analytics from cache: ${e}`)
  }
  return null
}
```

Cache analytics response:

```ts
const cache_analytics_response = async (
  cache_key: string,
  analytics_data: any
) => {
  try {
    await redis.set(
      cache_key,
      JSON.stringify(analytics_data),
      'EX',
      15 * 60
    )
  } catch (e) {
    console.error(`Error caching analytics response: ${e}`)
  }
}
```

Check out the whole file here:

<Details buttonText="index.ts" styles="lowercase">

```ts
import redis, { get_page_analytics } from '$lib/redis'
import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns'

export const object_to_query_params = (
  obj: { [s: string]: unknown } | ArrayLike<unknown>
) => {
  const params = Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
  return `?${params.join('&')}`
}

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

  const fetch_visits = async (
    from: string,
    to: string,
    grouping?: string
  ) => {
    const slug = `${base_path}&date_from=${from}&date_to=${to}${
      grouping ? `&date_grouping=${grouping}` : ''
    }`
    const cache_key = get_page_analytics(slug)

    const cached = await get_analytics_from_cache(cache_key)
    if (cached) {
      return cached
    }

    const res = await fetch(slug)
    const { analytics } = await res.json()
    await cache_analytics_response(cache_key, analytics)
    return analytics
  }

  const [daily_visits, monthly_visits, yearly_visits] =
    await Promise.all([
      fetch_visits(day_start, day_end),
      fetch_visits(month_start, month_end, 'month'),
      fetch_visits(year_start, year_end, 'year'),
    ])

  return {
    daily_visits,
    monthly_visits,
    yearly_visits,
  }
}

const get_analytics_from_cache = async (cache_key: string) => {
  try {
    const cached = await redis.get(cache_key)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.error(`Error fetching analytics from cache: ${e}`)
  }
  return null
}

const cache_analytics_response = async (
  cache_key: string,
  analytics_data: any
) => {
  try {
    await redis.set(
      cache_key,
      JSON.stringify(analytics_data),
      'EX',
      15 * 60
    )
  } catch (e) {
    console.error(`Error caching analytics response: ${e}`)
  }
}
```

</Details>

You'll notice that this time around I've wrapped all the call to the
Fathom API in a `Promise.all` to speed things up a bit.

That's it! Now I can go to the data browser tab over on Upstash and
see the data being cached.

The one drawback here is that I'm caching the data for 15 minutes, so
if I want to see the latest data, I'll have to wait 15 minutes. 😅

## Conclusion

As I discovered (the hard way), caching is an essential technique for
minimizing the impact of API calls in your projects.

I'm hoping this guide will give you an idea on how to implement
caching in your own SvelteKit projects.

<!-- Links -->

[sveltekit-and-fathom]:
  https://github.com/spences10/sveltekit-and-fathom
[adding real-time analytics to my sveltekit site with fathom]:
  https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
[fathom analytics with sveltekit]:
  https://scottspence.com/posts/fathom-analytics-with-svelte
[adding real-time analytics to my sveltekit site with fathom]:
  https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
[pr]: https://github.com/spences10/sveltekit-and-fathom/pull/168
[building sveltekit applications with serverless redis]:
  https://upstash.com/blog/svelte-with-serverless-redis
[geoff rich]: https://geoffrich.net
[ioredis]: https://github.com/luin/ioredis
