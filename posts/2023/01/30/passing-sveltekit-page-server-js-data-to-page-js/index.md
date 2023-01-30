---
date: 2023-01-30
title: Passing SvelteKit +page.server.js data to +page.js
tags: ['sveltekit', 'resource', 'how-to']
isPrivate: true
---

I came across this issue when adding [real-time analytics to my site],
essentially what I wanted to do was get some analytics data from a
server endpoint and pass that to the page.

In SvelteKit you can have different ways to get data onto a page,
[which I've detailed it in the past], what I didn't cover then was
what do you do when you have both a `+page.server.js` and a `+page.js`
file.

`+page.server.js` first then `+page.js`

<!-- Links -->

[real-time analytics to my site]:
  /posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom/
[which I've detailed it in the past]:
  /posts/data-loading-in-sveltekit#two-or-more-endpoints
