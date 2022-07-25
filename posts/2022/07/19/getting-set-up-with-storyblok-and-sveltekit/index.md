---
date: 2022-07-19
title: Getting set up with Storyblok and SvelteKit
tags: ['sveltekit', 'storyblok', 'how-to', 'guide']
isPrivate: true
---

<script>
  import Details from '$lib/components/details.svelte'
</script>

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
the URL of my local dev server.

I'll add in the suggested URL from the placeholder in the input field:

```bash
https://localhost:3000/
```

Yes! That is **`https`**!

Before clicking 'Save and show' I'll need to get my SvelteKit project
set up to enable the visual editor.

## SvelteKit and Vite HTTPS server setup

Storyblok needs to run from a HTTPS server, so unlike normal local
development (on HTTP) I'll need to create a local `HTTPS` server. To
do that I'll install the `@vitejs/plugin-basic-ssl` Vite plugin and
configure it. First up install the Vite plugin:

```bash
pnpm i -D @vitejs/plugin-basic-ssl
```

This is also a good time to set the server port as Vite will use the
default port (5173) otherwise.

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

I can start the dev server now (`pnpm run dev`) and the terminal
output will show the `HTTPS` server running.

Going to `https://localhost:3000/` on Edge I get a warning.

[![storyblok-your-connection-isnt-private]]
[storyblok-your-connection-isnt-private]

From here I can click on the 'Advanced' button and select the
'Continue to localhost (unsafe)' link.

[![storyblok-your-connection-isnt-private-advanced]]
[storyblok-your-connection-isnt-private-advanced]

Now I have access to `https://localhost:3000/` with a persistent
warning from Edge to show that I'm using a connection without a
certificate (~~`https`~~).

[![storyblok-not-secure]] [storyblok-not-secure]

Over to the visual editor page on Storyblok I can click on the 'Save
and show' button now.

The live preview will update showing a `404` page on here I need to
click on the sliders for 'Entry configuration' in the header and set
the 'Real path' as `/`.

[![storyblok-set-visual-editor-real-path]]
[storyblok-set-visual-editor-real-path]

Clicking 'Save & Close' will now show the SvelteKit skeleton project!

[![storyblok-connect-to-local-host-success]]
[storyblok-connect-to-local-host-success]

Now I can configure Storyblok to work with my local dev server and my
Storyblok project to show the page content type with it's nested types
on there.

## Storyblok bridge with Svelte

If you've not used Storyblok before this is where the magic happens.
The Svelte Storyblok SDK (amongst other things) allows the live
preview and editing of the components in Storyblok to be reflected on
the project running on `localhost`.

Install the [`@storyblok/svelte`] package and the Storyblok peer
dependency for `axios`, at the time of writing this was how I resolved
this. There's a mention of adding `axios` to `optimiseDeps` in the
[Add a Headless CMS to Svelte in 5 minutes] guide but adding that to
the `vite.config.js` file caused the same errors.

```bash
pnpm i -D @storyblok/svelte axios
```

Now onto the configuration!

## Create SvelteKit files for use with Storyblok

I'll create the files I'm going to need to get the connection between
the local SvelteKit project and the Storyblok project set up.

I'll need a SvelteKit layout file and some components to represent the
various content types in Storyblok. I'll need to create the following
files:

- Content type: page
- Nested (Block): grid, feature, teaser

I'll use the terminal to create the files and folders (directories)
needed:

```bash
# create layout file
touch src/routes/__layout.svelte
# create lib and components folders in src
mkdir -p src/lib/components
# Create the component files needed
touch src/lib/components/{feature.svelte,grid.svelte,page.svelte,teaser.svelte}
```

<Details buttonText="Click to expand"></Details>

## Env files

```bash
# draft
VITE_STORYBLOK_ACCESS_TOKEN=
VITE_STORYBLOK_STAGE=draft
# published
VITE_STORYBLOK_ACCESS_TOKEN=
VITE_STORYBLOK_STAGE=published
```

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

<Details buttonText="Click to expand">

```svelte
<script context="module">
  import Feature from '$lib/components/feature.svelte'
  import Grid from '$lib/components/grid.svelte'
  import Page from '$lib/components/page.svelte'
  import Teaser from '$lib/components/teaser.svelte'
  import { apiPlugin, storyblokInit } from '@storyblok/svelte'

  storyblokInit({
    accessToken: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
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

</Details>

## Svelte index (home) page

<Details buttonText="Click to expand">

```svelte
<script context="module">
  import { useStoryblokApi } from '@storyblok/svelte'

  export const load = async () => {
    const storyblokApi = useStoryblokApi()
    const {
      data: { story },
    } = await storyblokApi.get('cdn/stories/home', {
      version: import.meta.env.VITE_STORYBLOK_STAGE,
    })
    return {
      props: { story },
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

</Details>

## Svelte FAQ page

<Details buttonText="Click to expand">

```svelte
<script context="module">
  import { useStoryblokApi } from '@storyblok/svelte'

  export async function load() {
    const storyblokApi = useStoryblokApi()
    const {
      data: { story },
    } = await storyblokApi.get('cdn/stories/home', {
      version: import.meta.env.VITE_STORYBLOK_STAGE,
    })
    return {
      props: { story },
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

</Details>

## Conclusion

## Resources

<!-- Links -->

[svelte]: https://svelte.dev
[sveltekit]: https://kit.svelte.dev
[svelte.dev/tutorial]: https://svelte.dev/tutorial/basics
[learn.svelte.dev]:
  https://learn.svelte.dev/tutorial/welcome-to-svelte
[sign up for one]: https://app.storyblok.com/#!/signup
[`@storyblok/svelte`]: https://github.com/storyblok/storyblok-svelte
[add a headless cms to svelte in 5 minutes]:
  https://www.storyblok.com/tp/add-a-headless-cms-to-svelte-in-5-minutes#one-last-thing

<!-- Images -->

[storyblok-create-new-space]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658756723/scottspence.com/storyblok-create-new-space.png
[storyblok-switch-to-v2-sidebar]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658758071/scottspence.com/storyblok-switch-to-v2-sidebar.png
[storyblok-welcome-to-the-visual-editor]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658759454/scottspence.com/storyblok-welcome-to-the-visual-editor.png
[storyblok-your-connection-isnt-private]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658761547/scottspence.com/storyblok-your-connection-isnt-private.png
[storyblok-your-connection-isnt-private-advanced]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658761547/scottspence.com/storyblok-your-connection-isnt-private-advanced.png
[storyblok-not-secure]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658761547/scottspence.com/storyblok-not-secure.png
[storyblok-set-visual-editor-real-path]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658763198/scottspence.com/storyblok-set-visual-editor-real-path.png
[storyblok-connect-to-local-host-success]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1658763672/scottspence.com/storyblok-connect-to-local-host-success.png
