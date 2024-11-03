---
date: 2021-12-02
title: SvelteKit Fetch from GraphQL Endpoint with Variables
tags: ['svelte', 'api', 'graphql', 'how-to']
isPrivate: false
---

If you want to fetch data from a GraphQL endpoint, you can use the
browser fetch API without the need for any third party tools. You can
use the browser fetch API in SvelteKit on both the client and the
server.

In this first example I'm using the SvelteKit `context="module"` and
using the `load` function and the SvelteKit `fetch` to make the async
call to the GraphQL endpoint.

```svelte
<script context="module">
	export const load = async ({ fetch, page: { params } }) => {
		const slug = params
		const res = await fetch('https://mygraphqlendpoint/graphql', {
			method: 'POST',
			body: JSON.stringify({
				query: `
            query Post($slug: String!) {
              post(where: { slug: $slug }) {
                title
              }
            }
          `,
				variables: { slug },
			}),
		})
		if (res.ok) {
			const post = await res.json()
			return {
				props: { post },
			}
		}
	}
</script>

<script>
	export let post
</script>

<pre>{JSON.stringify(post, null, 2)}</pre>
```

Using the fetch outside of a context module you can do something
similar and use the Svelte `#await` directive while the promise
resolves.

This will be how you would use the browser fetch API in a Svelte
project that doesn't have the additional functionality that comes with
SvelteKit.

```svelte
<script>
	const getGraphQlQuery = async () => {
		const res = await fetch('https://mygraphqlendpoint/graphql', {
			method: 'POST',
			body: JSON.stringify({
				query: `
              query Post($slug: String!) {
                post(where: { slug: $slug }) {
                  title
                }
              }
            `,
				variables: { slug: 'my-query-slug' },
			}),
		})
		if (res.ok) {
			const post = await res.json()
			return { post }
		}
	}
	let post = getGraphQlQuery()
</script>

{#await post}
	<p>...waiting</p>
{:then { post }}
	<pre>{JSON.stringify(post, null, 2)}</pre>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
```

The main point is that GraphQL expects the body of the request to be a
stringified JSON object.

The `variables` property is optional and can be left empty.

```js
JSON.stringify({
	query: `
    query MyQuery($slug: String!) {
      post(where: { slug: $slug }) {
        title
      }
    }`,
	variables: { slug: 'my-query-slug' },
})
```
