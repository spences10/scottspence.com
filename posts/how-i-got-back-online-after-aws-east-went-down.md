---
date: 2023-06-13
title: How I got back online after AWS East went down
tags: ['vercel', 'analytics', 'sveltekit']
isPrivate: false
---

Ok, so there was an AWS outage and everyone that used AWS East was
affected. I use Vercel for hosting and they use AWS East so I was
affected.

Nothing was building, I took the outage advice and switched the
function region from `iad1` to `cle1` but that didn't work for me, the
builds finished but the site returned a 500 error.

What I did was switch off edge rendering.

In the endpoints I was using them for with Fathom Analytics (which was
also suffering an outage) I commented out the edge config.

In my `svelte.config.js` file I commented out the edge runtime config:

```js
kit: {
  // adapter: adapter({ runtime: 'edge' }),
  adapter: adapter(),
},
```

Then used the SvelteKit auto adapter:

```js
import adapter from '@sveltejs/adapter-auto'
```

So I'm not using edge functions for now.

This also brought to my attention that I needed to add in better error
handling for my analytics endpoints for if this happens again in the
future.
