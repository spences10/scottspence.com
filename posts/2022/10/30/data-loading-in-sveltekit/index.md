---
date: 2022-10-30
title: Data loading in SvelteKit
tags: ['sveltekit', 'resource', 'how-to']
isPrivate: true
---

With the recent changes to SvelteKit which has invalidated a _lot_ of
content already out there, I want to make some notes on how to load
data in SvelteKit.

First up, if you weren't aware, SvelteKit completely changed how file
based routing is done. There's a really comprehensive [migration
guide] from [Rich Harris] and [Simon H] over on GitHub on it.

## Page routing

If you don't want the background on the route changes then the
**TL;DR, is here:** [Get set up](#get-set-up).

I'll quickly go over the new routing system, as it's a bit different
to what it was, what I'll do is detail what the SvelteKit skeleton
(created with the SvelteKit CLI command `npm init svelte` or
`pnpm create svelte`) file structure looked like before and after.

I've removed a some of the other files that come with the skeleton for
brevity.

**Before**

```text
sveltekit-skeleton-example/
├─ src/
│  ├─ routes/
│  │  └─ index.svelte
│  └─ app.html
└─ package.json
```

And this is how it's now structured.

**After**

```text
sveltekit-skeleton-example/
├─ src/
│  ├─ routes/
│  │  └─ +page.svelte
│  └─ app.html
└─ package.json
```

Not a missive change, right? But let's take a look at how routes were
done vs how they are now. Let's say there was several other routes
`about`, `blog`, `contact` etc.

**Before**

```text
sveltekit-skeleton-example/
├─ src/
│  ├─ routes/
│  │  └─ about.svelte
│  │  └─ blog.svelte
│  │  └─ contact.svelte
│  │  └─ index.svelte
│  └─ app.html
└─ package.json
```

This could also be done via a directory, which was my preferred way of
grouping routes.

```text
sveltekit-skeleton-example/
├─ src/
│  ├─ routes/
│  │  └─ about/
│  │  │  └─ index.svelte
│  │  └─ blog/
│  │  │  └─ index.svelte
│  │  └─ contact/
│  │  │  └─ index.svelte
│  │  └─ index.svelte
│  └─ app.html
└─ package.json
```

**After**

```text
sveltekit-skeleton-example/
├─ src/
│  ├─ routes/
│  │  └─ about/
│  │  │  └─ +page.svelte
│  │  └─ blog/
│  │  │  └─ +page.svelte
│  │  └─ contact/
│  │  │  └─ +page.svelte
│  │  └─ +page.svelte
│  └─ app.html
└─ package.json
```

As always, people get mad when something changes. I was fine with the
changes when they came along and had load of fun refactoring all my
old projects to use the new system when it dropped.

## What is data loading?

Before a `+page.svelte` file is loaded there may be some data needed
for the page, like a list of products, or a list of blog posts. This
is where data loading comes in.

A `+page.svelte` file can have a sibling `+page.json.js` file that
runs a `load` function.

```js
/** @type {import('./$types').PageLoad} */
export const load = async () => {
  return {
    greeting: 'Hello world!',
  }
}
```

The return of the value (`greeting`) form the `load` function is
accessible to the `+page.svelte` file as a `data` prop. In Svelte
props are received into components with `export let`.

```svelte
<script>
  /** @type {import('./$types').PageData} */
  export let data;
</script>

<p>{data.greeting}</p>
```

```js
export const load = async ({ fetch }) => {
  const res = await fetch('https://api.coinlore.com/api/tickers/')
  const { data } = await res.json()
  return {
    currencies: data,
  }
}
```

## Get set up

<!-- Links -->

[migration guide]: https://github.com/sveltejs/kit/discussions/5774
[rich harris]: https://github.com/Rich-Harris
[simon h]: https://github.com/dummdidumm
