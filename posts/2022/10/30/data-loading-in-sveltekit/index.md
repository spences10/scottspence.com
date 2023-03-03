---
date: 2022-10-30
title: Data loading in SvelteKit
tags: ['sveltekit', 'resource', 'how-to']
isPrivate: false
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

This could also be done with a directory, which was my preferred way
of grouping routes.

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

## Using `+page.js|.ts`

Before a `+page.svelte` file is loaded there may be some data needed
for the page, like a list of products, or a list of blog posts. This
is where data loading comes in.

A `+page.svelte` file can have a sibling `+page.js` file that runs a
`load` function.

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
  export let data
</script>

<p>{data.greeting}</p>
```

Ok, so that data defined locally now I'll take a look at getting some
external data.

In the follwing example I'm using the [CoinLore API] to get the top
100 cryptocurrencies (which is the default request). It's a fun API to
play around with but for this example all I really need is some data
from an external source.

SvelteKit builds on top of the [Standard Web APIs] and makes them
available in the load function. You can see in the example here I'm
destructuring out the `fetch` function from the `context` object that
is available to the `load` function.

```js
/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
  const res = await fetch('https://api.coinlore.com/api/tickers/')
  const { data } = await res.json()
  return {
    currencies: data,
  }
}
```

I'm labelling the return value as `currencies` this is then shown in
the data being passed to `+page.svelte`.

```svelte
<script>
  /** @type {import('./$types').PageData} */
  export let data
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

Resulting data being displayed on the page is something like this:

```json
{
  "currencies": [
    {
      "id": "90",
      "symbol": "BTC",
      "name": "Bitcoin",
      "nameid": "bitcoin"
    },
    {
      "id": "80",
      "symbol": "ETH",
      "name": "Ethereum",
      "nameid": "ethereum"
    }
  ]
}
```

## Two or more endpoints?

I detailed this before in a post on how to [Fetch data from two or
more endpoints in SvelteKit] with `Promise.all`.

If you don't like the way you have to put the calls into an array then
adding them to their own variables is also fine.

```js
/** @type {import('./$types').PageLoad} */
export const load = async ({ fetch }) => {
  const fetchCoins = async () => {
    const res = await fetch('https://api.coinlore.com/api/tickers/')
    const { data } = await res.json()
    return data
  }
  const fetchCharacters = async () => {
    const res = await fetch('https://rickandmortyapi.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query AllCharacters {
            characters {
              results {
                name
                id
                image
              }
            }
          }
      `,
    })
    const {
      data: {
        characters: { results },
      },
    } = await res.json()
    return results
  }

  return {
    currencies: fetchCoins(),
    characters: fetchCharacters(),
  }
}
```

I've added an additional call to the page load function to get the
characters from the [Rick and Morty GraphQL API] then calling the
function for each of them.

## Using `+page.server.js|.ts`

Say if you have an API key that you don't want to expose on the client
(the browser) then you can use a `+page.server.js` file.

In here I can make a call to an API and pass in a secret key that I
have defined in a `.env` file.

```js
import { SECRET_TOKEN } from '$env/static/private'

/** @type {import('./$types').PageServerLoad} */
export const load = async ({ fetch }) => {
  // this is only logged out on the server
  console.log('=====================')
  console.log(SECRET_TOKEN)
  console.log('=====================')
  const fetchCoins = async () => {
    const res = await fetch('https://api.coinlore.com/api/tickers/')
    const { data } = await res.json()
    return data
  }

  return {
    currencies: fetchCoins(),
  }
}
```

The CoinLore API doesn't require a key so I'm just using a dummy token
defined in my `.env` file.

You can find out more about that in the [SvelteKit Environment
Variables with the SvelteKit $env Module] post I did a while back.

## Conclusion

In summary, use `+page.js` or `+page.ts` to load data for a page where
there's no need for authentication, or if you're not concerned about
any credentials being exposed on the client. If you need to load data
from an API that requires authentication where you want to keep
credentials from the client then use `+page.server.js` or
`+page.server.ts`.

That's it for this post, I hope you found it useful.

<!-- Links -->

[migration guide]: https://github.com/sveltejs/kit/discussions/5774
[rich harris]: https://github.com/Rich-Harris
[simon h]: https://github.com/dummdidumm
[coinlore api]: https://www.coinlore.com/cryptocurrency-data-api
[fetch]: https://kit.svelte.dev/docs/web-standards#fetch-apis
[standard web apis]: https://kit.svelte.dev/docs/web-standards
[fetch data from two or more endpoints in sveltekit]:
  https://scottspence.com/posts/fetch-data-from-two-or-more-endpoints-in-svelte
[rick and morty graphql api]: https://rickandmortyapi.com/graphql/
[sveltekit environment variables with the sveltekit $env module]:
  https://scottspence.com/posts/sveltekit-environment-variables-with-the-sveltekit-env-module
