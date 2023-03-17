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
from mt analytics provider Fathom, the subject line **"You've been
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

This example is a enhancement to the already existing
[sveltekit-and-fathom] project over on GitHub you can check out the
code over there.

All the changes for this post are in the [PR] and I'll be going over
the changes in this post.

For more information on the project for using Fathom and SvelteKit
check out the following:

- [Fathom Analytics with SvelteKit]
- [Adding real-time analytics to my SvelteKit site with Fathom]

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

So, some scene setting now, this is taking into account the previous
posts listed above.

I have an existing SvelteKit project with Fathom Analytics configured
and live analytics already. Now the purpose of this post is to
implement caching for the analytics and live visitors data.

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
