---
date: 2022-07-19
title: Getting set up with Storyblok and SvelteKit
tags: ['sveltekit', 'storyblok', 'how-to']
isPrivate: true
---

I've been having a play around with Storyblok this evening and want to
mke some notes on getting set up with it.

With the moving target that is the public beta of SvelteKit there's a
few things that have changed recently which I want to document here.

If you've not used SvelteKit before you'll need Node version 16
installed.

Get the SvelteKit project set up with a few commands:

```bash
npm init svelte storyblok-and-sveltekit
cd storyblok-and-sveltekit
pnpm i
```

## Get Storyblok setup

If you've not got a Storyblok account already then you'll need to sign
up.

You'll be greeted with a welcome screen and a button to 'Create a new
space'.

Clicking that you'll be taken to the 'Create a new space' page with
several options, the default 'Create new space' is good enough for
this guide. Give it a name then click the 'Create space' button.

You're then taken to the 'Content' section (in the left hand sidebar),
from here there's a list of content, as it was a new space (start from
scratch) there's only a home page content type there.

You'll also notice there's a 'Switch to V2' button, I'll be using the
V2 version so clicking on that will change the initial screen with the
'Home' page content type on there.

Clicking on the 'Home' content type will take you to the visual editor
displaying ✨ Welcome to the Visual Editor ✨ from this welcome
section you can copy the 'Access token' needed for accessing the
Storyblok API.

There's also a 'Set up preview url' section with an input field for
the URL or the your local dev server.

Storyblok needs to run from a HTTPS server, so unlike normal local
development (on HTTP) you'll need to install the
`@vitejs/plugin-basic-ssl` Vite plugin and configure it. First up
install the Vite plugin:

```bash
pnpm i -D @vitejs/plugin-basic-ssl
```

This is also a good time to set the server port as Vite will generate
a random port for you otherwise.

In the `vite.config.js` file add the following:

```js
import { sveltekit } from '@sveltejs/kit/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), basicSsl()],
  server: {
    port: 3000,
    https: true,
  },
}

export default config
```

In the 'Set up preview url' input add in the localhost URL with HTTPS
`https://localhost:3000/` then click 'Save and show'.

The live preview will update showing a `404` page on here you'll need
to click on the sliders for 'Entry configuration' in the header and
set the 'Real path' as `/`.
