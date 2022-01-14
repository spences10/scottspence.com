---
date: 2021-11-03
title: Fathom Analytics with SvelteKit
tags: ['analytics', 'svelte', 'sveltekit']
isPrivate: true
---

In this guide I'll go through the configuration needed to get set up
with Fathom Analytics in a SvelteKit project.

I'll cover getting set up, tracking goals and creating and using a
custom Fathom Domain.

Fathom Analytics is a privacy focused product that I have loved using
since 2019 now. I got tired of the confusing Google Analytics
dashboard and wanted something simpler to use and to use a product
that wasn't going to sell off the browsing data like Google does.

_If you're not already signed up you can get a $10 credit by signing
up with my [referral link]. Yes I get a kick back from this, it's an
awesome product and if you're interested in using it using the link
would really help me out._

So, Fathom, digital privacy first. They're GDPR, CCPA, ePrivacy, PECR
compliant. Their business model is selling software, not data. Because
of this, Fathom doesn't require cookie banners.

Enough selling! Let's get started!

## Prerequisites

I'll presume that you have a basic understanding of using a JavaScript
framework like Svelte and are familiar with using the command line
(CLI) to get certain tasks done.

So this means you already have a developement environment with Node a
terminal and a text editor like VS Code installed and ready to go. If
you don't then there are still services like GitPod and GitHub
Codespaces you can use from a browser.

## Create a Fathom site

Before I get into configuring the SvelteKit project I'll need to
create a new site on Fathom. From my Fathom [settings] screen in the
sites section I can scroll down to the 'Create New Site' section and
enter a site name. I'm calling this one [`ideal-memory`].

That link is a public Fathom dashboard you can go and check out now if
you like.

ℹ️ The site name doesn't have to corespond with the actual project
name but it could get confusing if it doesn't and you have a lot of
sites.

Here's what the create new site section looks like:

[![fathom-create-new-site-section]] [fathom-create-new-site-section]

After clicking the 'Create New Site' button the embed dialogue will
show with the Site ID, take a note of the site ID or copy the embed
code:

[![fathom-new-site-configuration]] [fathom-new-site-configuration]

That's it for now on the Fathom side of things, I'll leave this
dialogue open and go back to this once I've set up the project.

## Create the SvelteKit skeleton project

You can integrate Fathom with your current SvelteKit project but I'm
going to do this with the SvelteKit skeleton project so you can get an
idea of what's going on here.

I'm going to create the project with the following command, I use
`pnpm` but if you're following along you can use your package manager
of choice (like `npm` or `yarn`):

```bash
pnpm init svelte@next sveltekit-and-fathom
```

I'll choose the following options from the CLI:

```bash
✔ Skeleton project
✔ Use TypeScript? › No
✔ Add ESLint for code linting? › No
✔ Add Prettier for code formatting? › Yes
```

I'll change directory (`cd`) into the project and install the
dependencies:

```bash
cd sveltekit-and-fathom
pnpm i
```

Now I can check out the project in VS Code, the file structure looks
like this:

```bash
sveltekit-and-fathom/
├─ node_modules/
├─ src/
│ └─ routes/
│   └─ index.svelte
├─ static/
│   └─ favicon.png
├─ .env
├─ .gitignore
├─ .prettierrc
├─ jsconfig.json
├─ package.json
├─ pnpm-lock.yaml
├─ README.md
└─ svelte.config.js
```

## Add Fathom details to `.env` file

Create a `.env` file in the root of the project and add in the Fathom
`SiteID` and the Fathom tracking script variables for Vite to use,
this bash command will do the trick:

```bash
touch .env
echo VITE_FATHOM_ID= >> .env
echo VITE_FATHOM_URL= >> .env
```

Then add the `SiteID` and the tracking script to the variables to the
`.env` file:

```js
VITE_FATHOM_ID=NYMDTPLM
VITE_FATHOM_URL=https://cdn.usefathom.com/script.js
```

The reason for using a `.env` file if because a lot of ad blockers
will scrape it and add it to their block lists.

## Install and config Fathom client

To start tracking page views I'll first need to install
[`fathom-client`] via `pnpm` as a dev dependency:

```bash
pnpm i -D fathom-client
```

To start tracking page views the Fathom client will need to be in a
place that wraps all the pages in the project.

I'll use the `__layout.svelte` component for this, it will be applied
to every page in the project and can also be used to add styles and
components I want visible on each page.

Currently there's only one page in the `routes` directory for the
`index.svelte` page. I'll add in an `about.svelte` and a
`services.svelte` page as well for now.

I'll do this with one bash command in the terminal:

```bash
touch src/routes/{__layout,about,services}.svelte
```

After running that I have a couple of new files in my `src/routes`
directory:

```bash
sveltekit-and-fathom/
│ └─ routes/
│   ├─ __layout.svelte
│   ├─ about.svelte
│   ├─ index.svelte
│   └─ services.svelte
```

The `about` and `services` files are so I can check the route change
in my Fathom dashboard once I've configured the client, which I'll do
now.

In the `__layout.svelte` file I'll add this:

```svelte
<script>
  import { browser } from '$app/env';
  import { page } from '$app/stores';
  import * as Fathom from 'fathom-client';
  import { onMount } from 'svelte';

  onMount(async () => {
    Fathom.load('NYMDTPLM', {
      url: 'https://cdn.usefathom.com/script.js',
    })
  })

  $: $page.pathname, browser && Fathom.trackPageview()
</script>

<ul>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/services">Services</a>
</ul>

<slot />
```

Let's break down what's going on here, importting the `browser`
indicates if the project is running in the browser or not, this will
return a Boolean (`true`, `false`) value. You can read more about
[`$app/env`] on the SvelteKit documentation.

Using `page` for the `$page.pathname` this is the route for the
current page that has been loaded. You can read more about
[`$app/stores`] on the SvelteKit documentation. The `$` is so that I
can subscribe to changes in that (`page`) store.

[`onMount`] is used to run after the `__layout` component has loaded,
that's when I'm running the Fathom client and passing in my Fathom
site ID.

If you're not familiar with Svelte the the `$:` might look a bit
funky, you can learn more about it on the [Svelte
Reactivity/Declarations] tutorial. The `&&` is a shortcircuit
evaluation to if there's no `browser` then `Fathom.trackPageview()`
wont run.

ℹ️ As a side note here I will be using the Fathom `SiteID` and script
URL in an `.env` file so that it's not visible when I commit the code
to GitHub.

If you're using the environment variables you can replace the
hard-coded strings for the `id` and `url` with the variables, like
this:

```js
onMount(async () => {
  Fathom.load(import.meta.env.VITE_FATHOM_ID, {
    url: import.meta.env.VITE_FATHOM_URL,
  })
})
```

Ok, with that explanation out of the way time to see if the client is
working.

## Validate the project is working on Fathom

As I noted earlier, a lot of ad blockers will have the Fathom tracking
script added to their block lists. If you're using and ad blocker and
you want to validate it's working then you will probably want to use a
private browser window without the ad blocker enabled.

Don't worry you can bypass all ad blockers by setting up a custom
domain with Fathom, more on that later though! For now just use a
private browser window to validate it's working.

<!-- Links -->

[referral link]: https://usefathom.com/ref/HG492L
[settings]: https://app.usefathom.com/#/settings/sites
[`ideal-memory`]:
  https://app.usefathom.com/share/nymdtplm/ideal-memory
[`fathom-client`]: https://github.com/derrickreimer/fathom-client
[`$app/env`]: https://kit.svelte.dev/docs#modules-$app-env
[`$app/stores`]: https://kit.svelte.dev/docs#modules-$app-stores
[`onmount`]: https://svelte.dev/docs#onMount
[svelte reactivity/declarations]:
  https://svelte.dev/tutorial/reactive-declarations

<!-- Images -->

[fathom-create-new-site-section]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1642153115/scottspence.com/fathom-create-new-site-section.png
[fathom-new-site-configuration]:
  https://res.cloudinary.com/defkmsrpw/image/upload/v1642153887/scottspence.com/fathom-new-site-configuration.png
