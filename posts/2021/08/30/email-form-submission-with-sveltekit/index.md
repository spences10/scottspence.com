---
date: 2021-08-30
title: Make an Email Form Submission with Sveltekit
tags: ['sveltekit', 'how-to', 'svelte']
isPrivate: true
---

<script>
  import NewsletterSignup from '$lib/components/newsletter-signup.svelte'
</script>

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
the Revue one deployed it to Vercel and it worked! Joy! Ok onto the
how to!

## Setup the project

In this example like the last couple of examples I've done I'll be
using Matt Jennings' [SvelteKit blog template] it's what this site is
based off of.

This is for a SvelteKit project running on Vercel, if you're following
along then this is what I'm doing:

```bash
git clone git@github.com:mattjennings/sveltekit-blog-template.git
cd sveltekit-blog-template
npm i
```

Matt's example uses the SvelteKit `adapter-static` and because I'm
deploying to Vercel I'll need to install `adapter-vercel` and replace
that in the `svelte.config.js`:

```bash
# uninstall adapter-static
npm un @sveltejs/adapter-static
# install adapter-vercel
npm i @sveltejs/adapter-vercel@next
```

Then it's a case of swapping out `adapter-static` with
`adapter-vercel`:

```js
import adapter from '@sveltejs/adapter-vercel'
import { mdsvex } from 'mdsvex'
import preprocess from 'svelte-preprocess'
import mdsvexConfig from './mdsvex.config.js'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    mdsvex(mdsvexConfig),
    [
      preprocess({
        postcss: true,
      }),
    ],
  ],

  kit: {
    target: '#svelte',
    adapter: adapter(),
  },
}

export default config
// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV
const dev = mode === 'development'
process.env.TAILWIND_MODE = dev ? 'watch' : 'build'
```

The rest of the config here isn't really pertenant, what matters is
that I have swapped out `adapter-static` with `adapter-vercel` here.

<!-- Links -->

[sveltekit blog template]:
  https://github.com/mattjennings/sveltekit-blog-template
