---
date: 2023-06-13
updated: 2023-06-14
title: How I got back online after AWS East went down
tags: ['vercel', 'analytics', 'sveltekit']
isPrivate: false
---

Ok, so there was an AWS outage and everyone that used AWS East was
affected. I use Vercel for hosting and they use AWS for their edge
rendering lambdas (in AWSEast) so I was affected.

I have some analytics I bring in from Fathom Analytics (which was also
suffering from the outage) and what alerted me to the issue in the
first place.

This also brought to my attention that I needed to add in better error
handling for my analytics endpoints for if this happens again in the
future.

Nothing was building, I took the outage advice and switched the
function region from `iad1` to `cle1` but that didn't work for me, the
builds finished but the site returned a 500 error.

What I did was switch off edge rendering. It's a nice to have for me
and not a deal breaker and what was causing the builds either failing
or not finishing.

In my endpoints I commented out the `edge` runtime config:

```js
// export const config: ServerlessConfig = {
//   runtime: 'nodejs18.x',
// }
```

Then in my `svelte.config.js` file I commented out the edge runtime
config:

```js
kit: {
  // adapter: adapter({ runtime: 'edge' }),
  adapter: adapter(),
},
```

Then installed and switched to the SvelteKit auto adapter:

```js
import adapter from '@sveltejs/adapter-auto'
```

Up until the outage was over I was using the auto adapter and it was
working fine.

I now switched back to the edge runtime and it's working again.

Sort of begs the question, do I really need edge rendering? I'm not
sure, I'll see how it goes for now.

Anyway, leaving this here for future reference.
