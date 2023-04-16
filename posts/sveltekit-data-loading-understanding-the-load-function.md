---
date: 2023-04-14
title: SvelteKit Data Loading, Understanding the load function
tags: ['sveltekit', 'resource', 'how-to']
isPrivate: true
---

<script>
  import { Banner, DateDistance as DD, Details } from '$lib/components'

  const skeleton_info = {
    type: 'info',
    message: `The SvelteKit skeleton project is one of the CLI options 
      when you create a new SvelteKit project with the <code>pnpm create
      svelte</code> command.`,
  }
</script>

During a workshop I was hosting at CityJS (<DD date="2023-03-29"/>
ago) for getting started with Svelte and SvelteKit, I received some
valuable feedback from an attendee who was unclear about the role of
the load function in SvelteKit.

This prompted me to revisit this topic and provide a more in-depth
explanation for developers new to SvelteKit. In this post, I'll focus
on understanding the load function in SvelteKit and how it's used.

So, to do that, first I'm going to need to explain routing and the
file notation in SvelteKit. 😅

## Routing in SvelteKit

In SvelteKit, the `+` file notation is used to indicate that a file is
part of a route. If I take a look at the `src/routes` directory in the
SvelteKit skeleton it looks like this:

```text
└── +page.svelte
```

So, in the example above, running the dev server (`pnpm run dev`) and
visiting `localhost:5173` will render the `+page.svelte` file.

<Banner options={skeleton_info} />

Each route can have _one_ or _many_ of the following files:

```text
+page.svelte
+page.ts
+page.server.ts
+layout.svelte
+layout.ts
+layout.server.ts
+error.svelte
+server.ts
```

At a high level, here's a summary of what each file does:

- `+page.svelte`: represents a page, it is a standalone file that will
  be rendered when the corresponding route is accessed.
- `+page.ts`: a module that exports a `load` function that fetches
  data for a page.
- `+page.server.ts`: exports `load` function that will be run on the
  server.
- `+layout.svelte`: a layout component that wraps multiple pages,
  allowing you to share components across pages.
- `+layout.ts`: a module that exports a `load` function that fetches
  data for the layout component. This data is available to all child
  pages.
- `+layout.server.ts`: exports `load` function that will be run on the
  server.
- `+error.svelte`: a special page that is rendered when an error
  occurs during loading or rendering of a page.
- `+server.ts`: used to define custom API routes (endpoints) that
  handle HTTP requests.

I'll dig into these more in the following sections.

This is a basic idea of what the file notation in SvelteKit is used
for, I'll also take a look at component props (short for properties)
in SvelteKit.

## Component props

In Svelte components, `export let` is used to declare a variable as a
prop, which allows it to receive data from a parent component.

In the following example, the `name` prop is declared and set to
`World` by default.

```svelte
<script>
  export let name = 'World'
</script>

<p>Hello, {name}!</p>
```

In the parent, be that a Svelte component or a SvelteKit
`+page.svelte` route, the `name` prop can be set to a different value.

```svelte
<script>
  import Greeting from './Greeting.svelte'
</script>

<Greeting name="Svelte" />
```

Why `export let` though?

I'll refer to the [MDN reference for `export`] which states:

> The export declaration is used to export values from a JavaScript
> module. Exported values can then be imported into other programs
> with the import declaration or dynamic import. The value of an
> imported binding is subject to change in the module that exports it
> — when a module updates the value of a binding that it exports, the
> update will be visible in its imported value.

In essence this ensures that when a component prop changes it will
update the value of the prop in the parent component.

This also enables two-way binding, which is a feature of Svelte. More
on that in the [Data Binding in Svelte] post I did a few years back.

## Adding additional routes

If I wanted to add a route for `/about`, I'd need to create a
directory (or folder) with a `+page.svelte` file in that directory.

I can do this with a bash command like this:

```bash
mkdir src/routes/about
touch src/routes/about/+page.svelte
```

The folder structure would look like this now:

```text
├── about/
│   └── +page.svelte
└── +page.svelte
```

In the `src/routes/about/+page.svelte` file, I can add some content to
render.

```svelte
<h1>This is the about page</h1>
```

Now, if I visit `localhost:5173/about`, I'll see the `+page.svelte`
for the about route.

## Data loading

Now that I've detailed routing and component props in SvelteKit, I can
explain how the `load` function is used.

If I wanted to load some data for the about page, I could create a
`+page.ts` file alongside the `+page.svelte` file in the `/about`
folder.

```bash
touch src/routes/about/+page.ts
```

Now there's an associated `+page.ts` file for the `+page.svelte` file:

```text
├── about/
│   ├── +page.svelte
│   └── +page.ts
└── +page.svelte
```

This is a contrived example, but say in that file, if I want to get
some data (from an external source later) I can use the SvelteKit
`load` function that will return that data to be used in the
`+page.svelte` file.

I'll make a simplified example for now and just return an object with
a title property in the `src/routes/about/+page.ts` file:

```ts
export const load = () => {
  return {
    title: 'This data is from the load function',
  }
}
```

In SvelteKit, the `+page.svelte` file is a Svelte component, so it can
also receive props. The `data` prop is reserved in SvelteKit routes to
receive the data from a `load` function.

In the `src/routes/about/+page.svelte` file, I can receive the `data`
prop and use it in the page.

I can just log out the data into a `<pre>` tag for now to see the
data:

```svelte
<script lang="ts">
  export let data
</script>

<h1>This is the about page</h1>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

Then I can use the data in the page and access the `title` property:

```svelte
<script lang="ts">
  export let data
</script>

<h1>This is the about page</h1>

<p>{data.title}</p>
```

So, yes, a super simple example which I hope help illustrate how the
`load` function works in SvelteKit.

## Go deeper, practical examples

Ok, now onto some practical examples of using the `load` function.

So the most common use case for the `load` function is to fetch data
from an external source, like an API. I'll be using two APIs in the
following examples, the [Coinlore API] (REST) and the [Rick and Morty
API] (GraphQL).

In the following sections I'll go through various examples of fetching
data from an API on the server and client.

## Fetching page data, client

Ok, I'll start with fetching the top 100 cryptocurrencies from the
[Coinlore API] on the client.

I'll use the index route for this, so I'll add in a `+page.ts` file
for the index route:

```bash
touch src/routes/+page.ts
```

My `/routes` folder now looks like this:

```text
├── about/
│   └── +page.svelte
├── +page.svelte
└── +page.ts
```

In the `+page.ts` file, I'll create a `load` function, destructure the
SvelteKit `fetch` and create a response variable to store the data.

```ts
export const load = async ({ fetch }) => {
  const response = await fetch(
    'https://api.coinlore.com/api/tickers/'
  )
  const currencies = await response.json()
  return currencies
}
```

This example doesn't have any error handling, I'll add in some simple
error handling:

```ts
export const load = async ({ fetch }) => {
  try {
    const response = await fetch(
      'https://api.coinlore.com/api/tickers/'
    )
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    const currencies = await response.json()
    return { currencies }
  } catch (error) {
    console.error(error)
    return { error: 'Unable to fetch currencies' }
  }
}
```

The return value of the `load` function is the data that will be
available in the `+page.svelte` file as the `data` prop.

In the `+page.svelte` file, I'll receive the `data` prop and use it in
the page. I'll just log out the data into a `<pre>` tag for now to see
the data:

```svelte
<script lang="ts">
  export let data
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

That gives me an output similar to this on the page:

```json
{
  "currencies": {
    "data": [
      {
        "id": "90",
        "symbol": "BTC",
        "name": "Bitcoin",
        "nameid": "bitcoin",
        "rank": 1
      }
    ]
  }
}
```

Now I've validated the data is being fetched from the API, I can
iterate over the data and render it on the page with a Svelte each.

```svelte
<script lang="ts">
  export let data
</script>

<h1>Top 100 Cryptocurrencies</h1>

<ul>
  {#each data.currencies.data as coin}
    <li>{coin.name}</li>
  {/each}
</ul>
```

Now, say I have data from another API I want to fetch on the client.
I'll use the [Rick and Morty API] in the next example along with the
Coinlore API.

## Fetching page data from multiple sources

I'll show an example of how I'd get the data from the Rick and Morty
API now, this is appending headers to the `fetch` function along with
a post method on the request and returning stringified JSON data.

```ts
export const load = async ({ fetch }) => {
  const query = `query AllCharacters {
    characters {
      results {
        name
        id
        image
      }
    }
  }`

  try {
    const response = await fetch(
      'https://rickandmortyapi.com/graphql/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const { data } = await response.json()
    return { characters: data.characters.results }
  } catch (error) {
    console.error(error)
    return { error: 'Unable to fetch characters' }
  }
}
```

Notice that I'm returning `characters` from the
`data.characters.results` results here, it cleans up the data returned
to the `+page.svelte` file.

Also note that I'm not using a client like `graphql-request` to make
the request, I'm using the `fetch` function from SvelteKit.

So, now I can combine the data from the Coinlore API and the Rick and
Morty API.

```ts
export const load = async ({ fetch }) => {
  const query = `query AllCharacters {
    characters {
      results {
        name
        id
        image
      }
    }
  }`

  try {
    const response = await fetch(
      'https://rickandmortyapi.com/graphql/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const { data } = await response.json()

    const fetchCoins = async () => {
      const response = await fetch(
        'https://api.coinlore.com/api/tickers/'
      )
      const { data } = await response.json()
      return data
    }

    const currencies = await fetchCoins()

    return { characters: data.characters.results, currencies }
  } catch (error) {
    console.error(error)
    return { error: 'Unable to fetch data' }
  }
}
```

There's one issue with this approach, this is causing a waterfall
where the Coinlore API request is only made after the Rick and Morty
API request.

If I check the network tab in the browser I can see they call are
being made one after the other:

[![sveltekit-data-loading-understanding-the-load-function-waterfall]]
[sveltekit-data-loading-understanding-the-load-function-waterfall]

To avoid that I can wrap both the API calls in their own functions and
the promise from each will be resolved at the same time:

```ts
export const load = async ({ fetch }) => {
  const query = `query AllCharacters {
    characters {
      results {
        name
        id
        image
      }
    }
  }`

  try {
    const fetchCharacters = async () => {
      const res = await fetch(
        'https://rickandmortyapi.com/graphql/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        }
      )

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
      }

      const { data } = await res.json()
      return data.characters.results
    }

    const fetchCoins = async () => {
      const response = await fetch(
        'https://api.coinlore.com/api/tickers/'
      )

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }
      const { data } = await response.json()
      return data
    }

    return {
      characters: fetchCharacters(),
      currencies: fetchCoins(),
    }
  } catch (error) {
    console.error(error)
    return { error: 'Unable to fetch data' }
  }
}
```

Alternatively I can use a `Promise.all` to resolve both promises at:

```ts
export const load = async ({ fetch }) => {
  const query = `query AllCharacters {
    characters {
      results {
        name
        id
        image
      }
    }
  }`

  try {
    const [charactersResponse, currenciesResponse] =
      await Promise.all([
        fetch('https://rickandmortyapi.com/graphql/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        }),
        fetch('https://api.coinlore.com/api/tickers/'),
      ])

    if (!charactersResponse.ok) {
      throw new Error(`HTTP error: ${charactersResponse.status}`)
    }

    if (!currenciesResponse.ok) {
      throw new Error(`HTTP error: ${currenciesResponse.status}`)
    }

    const charactersData = await charactersResponse.json()
    const currenciesData = await currenciesResponse.json()

    const characters = charactersData.data.characters.results
    const currencies = currenciesData.data

    return { characters, currencies }
  } catch (error) {
    console.error(error)
    return { error: 'Unable to fetch data' }
  }
}
```

Now if I take a look at the network tab in the browser, I can see that
both requests are made in parallel:

[![sveltekit-data-loading-understanding-the-load-function-parallel]]
[sveltekit-data-loading-understanding-the-load-function-parallel]

Aight, now I'll take a look at how to fetch data on the server.

## Fetching page data, server

## Fetching layout data, client

## Fetching layout data, server

## Conclusion

In this post I've covered the basics of SvelteKit, including routing,
component props, and the `load` function.

I've also covered how to fetch data from external sources on the
client and server.

I hope this post has helped you get started understanding how to load
data with SvelteKit.

<!-- Links -->

[MDN reference for `export`]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
[Data Binding in Svelte]:
  https://scottspence.com/posts/data-binding-in-svelte
[Coinlore API]: https://api.coinlore.com/api/tickers
[Rick and Morty API]: https://rickandmortyapi.com/graphql

<!-- Images -->

[sveltekit-data-loading-understanding-the-load-function-waterfall]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1681633125/sveltekit-data-loading-understanding-the-load-function-waterfall.png
[sveltekit-data-loading-understanding-the-load-function-parallel]:
  https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1681638359/sveltekit-data-loading-understanding-the-load-function-parallel.png
