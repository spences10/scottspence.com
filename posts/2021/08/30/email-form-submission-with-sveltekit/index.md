---
date: 2021-08-30
title: Make an Email Form Submission with Sveltekit
tags: ['sveltekit', 'how-to', 'svelte']
isPrivate: true
---

Bit of preamble before I kick this off, subscribers to my newsletter
will know that I've been through a couple of platforms now (Zoho,
SendGrid, Revue then Substack). I settled on Substack because of the
editing experience what I didn't want to settle on was the janky embed
you get with Substack.

Check it out!

<iframe
  title="substack_subscribe"
  src="https://spences10.substack.com/embed"
  width="100%"
  height="320"
  style="border:1px solid #EEE; background:transparent;"
  frameborder="0"
  scrolling="no"
/>

Depending on what theme you're using this can potentially be
acceptable, probably not though!

I did get my own custom form working with Substack locally. The
**Tl;Dr** is I popped open the network tab in the browser and made a
note of where the submission was going and checked out the payload so
I could try make a similar submission with Insomnia. This worked
locally! But on deploying to Vercel the submit wasn't working and I
went back to using the Substack embed. Sad times!

## Revue has an open API

Then I remembered that Revue had an open API with docs and everything
so I created an account (I deleted my old one) and tried out the same
with Insomnia, it worked! So I swapped out the Substack endpoint with
the Revue one deployed it to Vercel and it worked! Joy!
