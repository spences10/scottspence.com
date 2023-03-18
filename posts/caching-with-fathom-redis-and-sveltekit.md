---
date: 2023-03-17
title: Caching with Fathom, Redis, and SvelteKit
tags: ['analytics', 'sveltekit', 'fathom']
isPrivate: true
---

<script>
  import { Tweet } from 'sveltekit-embed'
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
for his post on the Upstash for [Building SvelteKit Applications with
Serverless Redis] Geoff is a great blogger who's site a get a lot of
value out from.

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

So, the path for Fathom Analytics API response for the visitors isn't
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
file to use the Redis client.

I'll add in some additional functions, first I'll need to check if the
data is in the cache with `get_visitors_from_cache`, if it is then
I'll return that, if not then I'll make the call to the Fathom API
with `get_visitors_from_api` cache the response (in Redis) then return
the data.

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

Let's get into the detail of the functions here:

- `get_visitors_from_cache` - this function checks if the data is in
  the cache and returns it if it is.
- `cache_fathom_response` - this function caches the data in Redis
- `get_visitors_from_api` - this function makes the call to the Fathom
  API and returns the data.

## Page analytics

<!-- Links -->

[sveltekit-and-fathom]:
  https://github.com/spences10/sveltekit-and-fathom
[Adding real-time analytics to my SvelteKit site with Fathom]:
  https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
[Fathom Analytics with SvelteKit]:
  https://scottspence.com/posts/fathom-analytics-with-svelte
[Adding real-time analytics to my SvelteKit site with Fathom]:
  https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom
[PR]: https://github.com/spences10/sveltekit-and-fathom/pull/168
[Building SvelteKit Applications with Serverless Redis]:
  https://upstash.com/blog/svelte-with-serverless-redis
[Geoff Rich]: https://geoffrich.net
[ioredis]: https://github.com/luin/ioredis
