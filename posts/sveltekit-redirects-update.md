---
date: 2024-10-08
title: Updating SvelteKit Redirects - A More Robust Approach
tags: ['sveltekit', 'seo', 'guide', 'how-to']
is_private: false
---

<script>
  import { DateDistance } from '$lib/components'
</script>

It's been <DateDistance date='2023-02-06' /> since I last wrote about
implementing redirects for changed post routes in SvelteKit. In that
time, SvelteKit has evolved, and so has my approach to handling these
redirects. Today, I'm sharing an update on how I've improved this
implementation to be more robust and hopefully resolve some lingering
issues with Google Search Console.

For the **Tl;Dr** skip to the
[new implementation](#the-new-implementation).

Check out the original post
[How to Implement Redirects for Changed Post Routes in Sveltekit](https://scottspence.com/posts/how-to-implement-redirects-for-changed-post-routes-in-sveltekit)
for more context on the problem and the solution.

## The challenge

Despite implementing the redirects as described in the previous post,
I've noticed that Google Search Console still shows redirect issues
for some of my old URLs. This has been a bit of a head-scratcher, as
the redirects seemed to be working correctly when tested manually.

## The new implementation

To address this, I've moved the redirect logic into the
`hooks.server.ts` file. This approach intercepts requests at the
server level, before they even reach the routing system. Here's what
the new implementation looks like:

```ts
import { redirect } from '@sveltejs/kit'

export const handle = async ({ event, resolve }) => {
  const pathname = event.url.pathname

  // Handle old URL structure redirect
  const oldUrlMatch = pathname.match(
    /^\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)/,
  )
  if (oldUrlMatch) {
    const [, , , , slug] = oldUrlMatch
    throw redirect(301, `/posts/${slug}`)
  }

  // Handle trailing slash
  if (pathname !== '/' && pathname.endsWith('/')) {
    throw redirect(301, pathname.slice(0, -1))
  }

  // ... other handling logic ...

  return await resolve(event)
}
```

This new approach offers several advantages:

1. **Earlier Interception**: By handling redirects at the server hooks
   level, I catch and redirect requests before they even hit the
   routing logic. This should be more efficient and potentially more
   SEO-friendly.

2. **Consolidated Logic**: All the redirect logic is now in one place,
   making it easier to maintain and update.

3. **Trailing Slash Handling**: I'm now also handling trailing slashes
   consistently across the site, another headache for SEO.

## Cleaning up

With this new implementation, I was able to remove the old
`+server.ts` file located in `src/routes/[yyyy]/[mm]/[dd]/[slug]/`.
This cleans up the project structure and removes any potential
conflicts or confusion between different redirect implementations.

## The waiting game

While I'm confident that this new approach is more robust and should
resolve the issues showing up in Google Search Console, the reality is
that I won't know for certain for a few weeks. Google needs time to
recrawl the site and process these changes.

In the meantime, I'll be keeping a close eye on the Search Console
reports and monitoring for any unexpected behaviour.

## Conclusion

This update represents my latest attempt to handle redirects in the
most efficient and SEO-friendly way possible with SvelteKit.

I hope this update helps others who might be facing similar issues. As
always, web development is a journey of continuous learning and
improvement. I'll be sure to post another update if I discover any new
insights or if this implementation proves to resolve the Google Search
Console issues.

Stay tuned, and happy coding!
