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
so I created an account (I deleted my old one) and used Insomnia to
try out some of the API methods, it worked locally with Insomnia!

So I swapped out the Substack endpoint with the Revue one deployed it
to Vercel and tried it out. I could add new subscribers to my Revue
account! Joy! Ok onto the how to!

## Testing the Revue endpoint

Because Revue has an open API that means there's ✨[documentation]✨

If you're following along you will need your Revue API key, you can
find it at the bottom of the [integrations] page.

⚠️ Usual warning about exposing API keys here, there doesn't seem to
be a way to generate a new Revue API key, so if it's leaked somewhere
I'm not sure how you'd go about revoking it.

Using Insomnia the first thing I did was check out the POST method
with `https://www.getrevue.co/api/v2/subscribers` the request body was
this:

```json
{
  "email": "spences10apps+test@gmail.com",
  "first_name": "",
  "last_name": "",
  "double_opt_in": false
}
```

As a side note you can add a `+` to the end of an email address in
Gmail to give it a unique name. So in the case of the example `+test`
is what I'm using as a way to identify the email address.

The Bearer token looked like this `Token <your-api-key>`.

Hit Send button and wait for the response! I get a 200 OK with the
preview reply looking something like this:

```json
{
  "id": 5654821249,
  "list_id": 216568,
  "email": "spences10apps+test@gmail.com",
  "first_name": "",
  "last_name": "",
  "last_changed": "2021-08-31T20:10:24.197Z"
}
```

Alright, sweet! I can now add a subscriber to my Revue account!

## Setup the project

In this example like the last couple of examples I've done I'll be
using Matt Jennings' [SvelteKit blog template]; it's what this site is
based off of.

ℹ️ This is for a SvelteKit project hosted on Vercel, if you're
following along then this is what I'm doing:

```bash
git clone git@github.com:mattjennings/sveltekit-blog-template.git
cd sveltekit-blog-template
npm i
```

Matt's example uses the SvelteKit `adapter-static` and because I'm
deploying to Vercel I'll need to install `adapter-vercel` and add that
in the `svelte.config.js`:

```bash
# uninstall adapter-static
npm un @sveltejs/adapter-static
# install adapter-vercel
npm i @sveltejs/adapter-vercel@next
```

Then it's a case of swapping out the first line here `adapter-static`
with `adapter-vercel`:

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
that I have swapped out `adapter-static` with `adapter-vercel` I've
literally copied the code of what I'm working on.

<!-- Links -->

[sveltekit blog template]:
  https://github.com/mattjennings/sveltekit-blog-template
[documentation]: https://www.getrevue.co/api#get-/v2/lists
[integrations]: https://www.getrevue.co/app/integrations
