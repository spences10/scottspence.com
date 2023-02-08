---
date: 2023-01-29
title: Adding real-time analytics to my SvelteKit site with Fathom
tags: ['analytics', 'svelte', 'sveltekit', 'fathom']
isPrivate: true
---

I spent a bit of time the other day lookinginto the Fathom Analytics
API, this was something I took a look at around a year ago now, but I
didn't really get around to using it.

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

Fathom Analytics is paid service, well worth the money in my opinion.

If you've not seen any of my previous content check out the
[analytics] tag on the site here! I've written about them a ton in the
past and you can probably tell by now that I really love the product.

Anyways! Preamble over, let's get into how I did it.

## The Fathom API

The Fathom API is still (from what I can tell) early access, so you'll
need to email them to get access to it. You'll be notified when it's
ready with instructions on how to get started.

The [Fathom API documentation] in their own words is **absolutely
gorgeous** and I agree.

## My implementation

How to Implement Redirects for Changed Post Routes in Sveltekit. So
first up there needs to be a call to the Fathom API, I'll do that by
creating an server endpoint to call out to

<!-- Links -->

[referral code]: https://usefathom.com/ref/HG492L
[analytics]: https://scottspence.com/tags/analytics
[Fathom API documentation]: https://usefathom.com/api
