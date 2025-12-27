---
date: 2023-06-13
updated: 2023-06-18
title: How I got back online after AWS East went down
tags: ['vercel', 'analytics', 'sveltekit']
is_private: false
meta_description:
  Discover the steps I took to bring my website back online during a
  major AWS East outage, and learn how to ensure your website stays
  resilient in similar situations.
---

Ok, on 2023-06-13 there was an AWS outage and everyone that used AWS
East was affected. I use Vercel for hosting and they use AWS for their
edge rendering lambdas (in AWSEast) so I was affected.

I have some analytics I bring in from Fathom Analytics (which was also
suffering from the outage) and what alerted me to the issue in the
first place.

This also brought to my attention that I needed to add in better error
handling for my analytics endpoints for if this happens again in the
future.

## Recovering From the AWS Outage

Nothing was building, I took the outage advice and switched the
function region from `iad1` to `cle1` but that didn't work for me, the
builds finished but the site returned a 500 error.

## Switching Off Edge Rendering

What I did was switch off edge rendering. It's a nice to have for me
and not a deal breaker and it was what was causing the builds to
either fail or not finish.

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

## Using SvelteKit Auto Adapter

So, after that I thought it best not to use the Vercel SvelteKit
adapter either. I installed and switched to the SvelteKit auto
adapter:

```bash
pnpm i -D @sveltejs/adapter-auto
```

Then I switched out the adapter out at the top of my
`svelte.config.js` file imports:

```git
-import adapter from '@sveltejs/adapter-vercel'
+import adapter from '@sveltejs/adapter-auto'
```

This change allowed my website to function properly until the AWS
outage was resolved. After the resolution, I switched back to the edge
runtime.

Sort of begs the question, do I really need edge rendering? I'm not
sure, I'll see how it goes for now and I know how to switch it off if
I need to.

Anyway, leaving this here for future reference.

## References

Some useful bits I found:

- Vercel status page: https://www.vercel-status.com/
- To change your Vercel function region:
  `https://vercel.com/<vercel_user>/<project_name>/settings/functions`
- Configuring SvelteKit fo use with Vercel edge functions:
  https://vercel.com/docs/frameworks/sveltekit#configure-your-sveltekit-deployment
- How to specify vercel builds location (depreciated):
  https://github.com/orgs/vercel/discussions/1470

## Conclusion

Finding your way out of an AWS outage can (excuse the pun) put you on
edge, but with the right steps, I managed to minimize downtime and
keep my website running.

If you have any questions or need further clarification, feel free to
get in touch.
