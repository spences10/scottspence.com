---
date: 2022-07-19
title: Getting set up with Storyblok and SvelteKit
tags: ['sveltekit', 'storyblok', 'how-to', 'guide']
isPrivate: true
---

I've been having a play around with Storyblok this evening and want to
make some notes on getting set up with it.

With the moving target that is the public beta of SvelteKit there's a
few things that have changed recently which I want to document here.

If you've not used [Svelte] or [SvelteKit] before you can check out
the awesome tutorial for Svelte over on [svelte.dev/tutorial] it's got
everything you need. There's also [learn.svelte.dev] for SvelteKit
which is under development at the time of writing.

Minimum requirements will be a computer development setup with Node
version 16 installed and a text editor, I'll be using VS Code.

## Setup the SvelteKit project

I'll get the SvelteKit project set up with a few commands:

```bash
npm init svelte storyblok-and-sveltekit
cd storyblok-and-sveltekit
pnpm i
```

I'll be using `pnpm` for installing dependencies, if you perfer `npm`
or `yarn` you can use those instead. Just be aware if you're copy
pasting terminal commands you'll need to change that.

I'll be picking the following options from the SvelteKit CLI:

```bash
? Which Svelte app template? › - Use arrow-keys. Return to submit.
    SvelteKit demo app
❯   Skeleton project - Barebones scaffolding for your new SvelteKit app
? Add type checking with TypeScript? › - Use arrow-keys. Return to submit.
    Yes, using JavaScript with JSDoc comments
❯   Yes, using TypeScript syntax
    No
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … Yes
```

These are the options I usually always pick when creating any new
SvelteKit project. What I've picked will not impact the rest of this
guide, especially `ESLint`, `Prettier` and `Playwright`.

If you decide you want to go without `TypeScript` support then replace
the `<script lang="ts">` tags with `<script>` in the coming examples.

If you decide to go with JavaScript with JSDoc comments then you'll
still need to annotate for types.

I'll install dependencies then run the development server:

```bash
pnpm i
pnpm run dev
```

Going to `http://localhost:5173` will display the SvelteKit skeleton
project.

## Get Storyblok setup

If you're following along and you've not got a Storyblok account
already then you'll need to [sign up for one] otherwise sign in.

From here, I'm greeted with a welcome screen and a button to 'Create a
new space'.

Clicking that I'll be taken to the 'Create a new space' page with
several options, the default 'Create new space' is good enough for
this guide. I'll give it a name (I'm calling mine 'SvelteKit example'
very imaginative I know 😊) then I'll click the 'Create space' button.

[![storyblok-create-new-space]] [storyblok-create-new-space]

I'm then taken to the 'Content' section (in the left hand sidebar),
from here there's a list of content, as it was a new space (start from
scratch) there's only a home page content type shown in the main
screen.

You'll may also notice in the sidebar toward the bottom there's a
'Switch to V2' button.

[![storyblok-switch-to-v2-sidebar]] [storyblok-switch-to-v2-sidebar]

I'll be using the V2 version so clicking on that will change the
screen and take me to the 'Dashboard' in the sidebar, I can then
select 'Content' from the sidebar. On the main page I'll select the
'Home' page content type.

That takes me to the visual editor displaying **✨ Welcome to the
Visual Editor ✨** from this welcome section I can copy the 'Access
token' needed for accessing the Storyblok API.

[![storyblok-welcome-to-the-visual-editor]]
[storyblok-welcome-to-the-visual-editor]

There's also a 'Set up preview url' section with an input field for
the URL or the your local dev server.

## SvelteKit and Vite HTTPS server setup

Storyblok needs to run from a HTTPS server, so unlike normal local
development (on HTTP) I'll need to install the
`@vitejs/plugin-basic-ssl` Vite plugin and configure it. First up
install the Vite plugin:

```bash
pnpm i -D @vitejs/plugin-basic-ssl
```

This is also a good time to set the server port as Vite will use the
default port (5173) for you otherwise.

In the `vite.config.js` file I'll add the following:

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

## Storyblok bridge with Svelte

If you've not used Storyblok before this is where the magic happens.
The Svelte Storyblok SDK amongst other things allows the live preview
and editing of the components in Storyblok to be reflected on the
project running on `localhost`.

Install the [`@storyblok/svelte`] package:

```bash
pnpm i -D @storyblok/svelte
```

Now onto the configuration!

## SvelteKit layout file

A layout file in SvelteKit is a way to persist elements across route
changes

Time to create a `__layout.svelte` file:

```bash
touch src/routes/__layout.svelte
```

in the `src/routes` folder of the SvelteKit project. This is to make
use of `apiPlugin` and `storyblokInit` from the [`@storyblok/svelte`]
library.

You'll need to add in add the access token for the Storyblok space:

```svelte
<script context="module">
  import Feature from '$lib/components/feature.svelte'
  import Grid from '$lib/components/grid.svelte'
  import Page from '$lib/components/page.svelte'
  import Teaser from '$lib/components/teaser.svelte'
  import { apiPlugin, storyblokInit } from '@storyblok/svelte'

  storyblokInit({
    accessToken: 'i6PKqI8NukDVKJ6mjjN06wtt',
    use: [apiPlugin],
    components: {
      feature: Feature,
      grid: Grid,
      page: Page,
      teaser: Teaser,
    },
  })
</script>

<main>
  <slot />
</main>
```

## Svelte index (home) page

```svelte
<script context="module">
  import { useStoryblokApi } from '@storyblok/svelte'

  export async function load() {
    const storyblokApi = useStoryblokApi()
    const { data } = await storyblokApi.get('cdn/stories/home', {
      version: 'draft',
    })
    return {
      props: { story: data.story },
    }
  }
</script>

<script lang="ts">
  import {
    StoryblokComponent,
    useStoryblokBridge,
  } from '@storyblok/svelte'
  import { onMount } from 'svelte'

  export let story: any

  onMount(() => {
    useStoryblokBridge(story.id, newStory => (story = newStory))
  })
</script>

<div>
  {#if story}
    <StoryblokComponent blok={story.content} />
  {/if}
</div>
```

## Svelte FAQ page

```svelte
<script context="module">
  import { useStoryblokApi } from '@storyblok/svelte'

  export async function load() {
    const storyblokApi = useStoryblokApi()
    const { data } = await storyblokApi.get('cdn/stories/faq', {
      version: 'draft',
    })
    return {
      props: { story: data.story },
    }
  }
</script>

<script lang="ts">
  import {
    StoryblokComponent,
    useStoryblokBridge,
  } from '@storyblok/svelte'
  import { onMount } from 'svelte'

  export let story: any

  onMount(() => {
    useStoryblokBridge(story.id, newStory => (story = newStory))
  })
</script>

<div>
  {#if story}
    <StoryblokComponent blok={story.content} />
  {/if}
</div>
```

<!-- Links -->

[svelte]: https://svelte.dev
[sveltekit]: https://kit.svelte.dev
[svelte.dev/tutorial]: https://svelte.dev/tutorial/basics
[learn.svelte.dev]:
  https://learn.svelte.dev/tutorial/welcome-to-svelte
[sign up for one]: https://app.storyblok.com/#!/signup
[`@storyblok/svelte`]: https://github.com/storyblok/storyblok-svelte

<!-- Images -->

[storyblok-create-new-space]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658756723/scottspence.com/storyblok-create-new-space.png
[storyblok-switch-to-v2-sidebar]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658758071/scottspence.com/storyblok-switch-to-v2-sidebar.png
[storyblok-welcome-to-the-visual-editor]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658759454/scottspence.com/storyblok-welcome-to-the-visual-editor.png
