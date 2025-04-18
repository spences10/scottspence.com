---
date: 2022-10-01
title: Use URQL with SvelteKit
tags: ['sveltekit', 'how-to', 'svelte']
is_private: false
---

In this guide I'll be going through getting set up with the Universal
React Query Library (URQL) in SvelteKit. There's [documentation] you
can check out for URQL itself if you need to go more in depth. This
will be covering initialising the client and making some simple
queries with it.

If you weren't aware, I did a [post on this] a while back, (or you may
have been directed here from that post, maybe?) but if you've been
following SvelteKit for a while now you'll know that [things have
changed slightly].

So, let's get started!

## GraphQL endpoint

This time around I'll be using the [Rick and Morty GraphQL API] for
the data, querying the [GraphQL endpoint] with URQL.

If I go to the endpoint (linked in the last paragraph) I can have a
play around with querying the data in the provided Graph<em>i</em>QL
explorer.

There's two queries I'll be using for this, one to get all the
characters from the API and another to get a single character by ID.

First up I'll query for all the characters available on the API, the
query is this:

```graphql
query AllCharacters {
	characters {
		results {
			name
			id
			image
		}
	}
}
```

I'll put that into the left side panel in the explorer and hit the
play button, this returns a list of all the characters in the API.

<!-- cSpell:ignore rickandmortyapi,graphiql -->

[![rickandmortyapi-graphiql]] [rickandmortyapi-graphiql]

The other query is for a single character by ID, I can add another
query to the explorer by clicking the plus button next to where it
says Graph<em>i</em>QL in the top right of the page. In that tab I'll
add in the following query:

```graphql
query GetCharacter($id: ID!) {
	character(id: $id) {
		name
		image
		status
		species
		location {
			name
			type
		}
		episode {
			name
		}
	}
}
```

This query takes an ID as a variable (`query GetCharacter($id: ID!)`),
I can add that in by clicking (and expanding) the Variables panel in
the explorer.

If I open up some curly boys (braces) `{}` in the Variables panel and
hit Ctrl+Space I get some intellisense for the available variables
that can be used, in this case it's only the `id` variable that I will
get an option for. If I select that and add in a value, say `1` and
then hit the play button I get the following response:

[![rickandmortyapi-graphql-single-character]]
[rickandmortyapi-graphql-single-character]

Now I have the two queries I need to start working with the data in a
SvelteKit project.

## Set up the SvelteKit project

I use `pnpm` for my package manager, but you can use `npm` or `yarn`,
I'll start by scaffolding a new SvelteKit project.

```bash
pnpm create svelte sveltekit-with-urql
```

The first part `pnpm create svelte` is what will run the CLI script to
create the project and the `sveltekit-with-urql` part is the name of
the folder I'll create the project in.

I'll pick the following options from the CLI, if you're following
along pick whatever makes you happy:

```bash
✔ Which Svelte app template? › Skeleton project
✔ Add type checking with TypeScript? › Yes, using JavaScript with JSDoc comments
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? › Yes
✔ Add Playwright for browser testing? › Yes
```

Then I can follow the prompt from the CLI to change directory and
install the dependencies for URQL and the GraphQL:

```bash
# change into newly created project directory
cd sveltekit-with-urql
# install dependencies for URQL and GraphQL
pnpm i -D @urql/svelte graphql
```

Now I can test everything is working by running the project with
`pnpm run dev`.

## Setting up the URQL client

URQL is used on the client (the browser) so the calls to the API can
be made in Svelte `+page.svelte` and `+layout.svelte` files.

Because the the URQL client uses the [Svelte Context API] to
`setContextClient` and `getContextClient` there's no opinion as far as
I know where it should go. Typically I'll create a client it in a
place accessible by other pages so the most logical place (to me) is
to use the client in a Svelte layout page, I'll need to create that:

```bash
touch src/routes/+layout.svelte
```

Then I can initialise the client in the layout file using the URQL
`createClient` to create a `client` variable I can pass to the
`setContextClient` function.

```svelte
<script>
	import { createClient, setContextClient } from '@urql/svelte'

	const client = createClient({
		url: `https://rickandmortyapi.com/graphql`,
	})

	setContextClient(client)
</script>

<main>
	<slot />
</main>
```

All SvelteKit layout files should contain a `<slot />` element, this
is where the content of the pages will be rendered.

## Using the URQL client

With the client initialised in the layout file I can now use it in a
Svelte page.

In the `src/routes/+page.svelte` file I'll open up some script tags
and import everything I need from `@urql/svelte`.

I'll then create a variable to create a store for the first GraphQL
query I wrote in the Graph<em>i</em>QL editor on the API endpoint.

Now the response from the URQL client will be added to a Svelte store
`charactersQueryStore`. This means that if I want to access the data
from that store I'll need to use the `$` syntax to subscribe to
changes the store.

You'll notice that `getContextClient` is being passed into the
`queryStore` here after the initial creation of the client
(`setContextClient`) on the `+layout.svelte` page.

I'll just dump out the contents of `charactersQueryStore` to the page
in a pre tag for now to validate it's working:

```svelte
<script>
	import { getContextClient, gql, queryStore } from '@urql/svelte'

	const charactersQueryStore = queryStore({
		client: getContextClient(),
		query: gql`
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
</script>

<pre>{JSON.stringify($charactersQueryStore, null, 2)}</pre>
```

With that validated I can then start using the `$charactersQueryStore`
to start adding markup to the page.

I'll use an `if` block to conditionally render either a `Loading`
paragraph or an `Error` paragraph depending on the state of the store.

Then use an `each` block to loop over the characters in the store and
render them.

```svelte
<script>
	import { getContextClient, gql, queryStore } from '@urql/svelte'

	const charactersQueryStore = queryStore({
		client: getContextClient(),
		query: gql`
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
</script>

<h1>The World of Rick and Morty</h1>

<div>
	{#if $charactersQueryStore.fetching}
		<p>Loading...</p>
	{:else if $charactersQueryStore.error}
		<p>Oopsie! {$charactersQueryStore.error.message}</p>
	{:else}
		{#each $charactersQueryStore.data.characters.results as character}
			<section>
				<img src={character?.image} alt={character?.name} />
				<h2>{character?.name}</h2>
			</section>
		{/each}
	{/if}
</div>
```

<!-- cSpell:ignore oopsie -->

I'll break down what's happening here:

- I'm using the `$` syntax to subscribe to changes in the store.
- I'm using the `if` block to check if the store is `fetching` or
  `error` and then displaying a message to the user.
- I'm using the `each` block to loop over the data in the store and
  display it to the user.

Expressions in Svelte like the `if` statement can be understood like
this, `#` is the start `:` is a continuation and `/` is the end.

## Dynamic page routing with SvelteKit

Ok, I've got a nice list of characters, now I want to be able to click
on one of them and see a bit more detail on another page.

So, in the `<section>` tags I'll wrap the image and the character name
with an `<a>` tag and add a `href` attribute to point to the not yet
created folder for the character, here's what the section looks like
now:

```svelte
<section>
	<a data-sveltekit-prefetch href={`/character/${character?.id}`}>
		<img src={character?.image} alt={character?.name} />
		<h2>{character?.name}</h2>
	</a>
</section>
```

Here's what the page looks like now:

```svelte
<script>
	import { getContextClient, gql, queryStore } from '@urql/svelte'

	const charactersQueryStore = queryStore({
		client: getContextClient(),
		query: gql`
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
</script>

<h1>The World of Rick and Morty</h1>

<div>
	{#if $charactersQueryStore.fetching}
		<p>Loading...</p>
	{:else if $charactersQueryStore.error}
		<p>Oopsie! {$charactersQueryStore.error.message}</p>
	{:else}
		{#each $charactersQueryStore.data.characters.results as character}
			<section>
				<a
					data-sveltekit-prefetch
					href={`/character/${character?.id}`}
				>
					<img src={character?.image} alt={character?.name} />
					<h2>{character?.name}</h2>
				</a>
			</section>
		{/each}
	{/if}
</div>
```

The `data-sveltekit-prefetch` attribute is used to tell SvelteKit to
run the `load` function for the page before the user clicks the link.

The `character` and `id` will form the URL for the character page with
the `id` being the dynamic part of the URL.

Clicking one of the links now gives me a 404 error, that's because the
page doesn't exist yet. I'll create the route for the character and
the id for that character as a dynamic parameter for the path:

```bash
# make the character and [id] folders
mkdir -p src/routes/character/'[id]'
# make svelte and js files to go ito the [id] folder
touch src/routes/character/'[id]'/{+page.svelte,+page.js}
```

Clicking on the first character now (Rick Sanchez) takes me to the the
URL `http://localhost:5173/character/1`. The last section of the URL
(`1`) here is the `character.id` and the dynamic part of the routing.
This is what needs to be passed to the `GetCharacter` GraphQL query.

So I need to somehow get that `id` from the URL and pass it to the
`GetCharacter` GraphQL query.

## SvelteKit load function

Using the SvelteKit `load` function in the `+page.js` file I can get
the `params` from the URL.

If I add in a `load` function to the `+page.js` file, destructure the
`params` object out of the context and log out the `params` I can see
that the `id` is there:

```js
/** @type {import('@sveltejs/kit').Load} */

export const load = async ({ params }) => {
	console.log('=====================')
	console.log(params)
	console.log('=====================')
	return {}
}
```

With this I can destructure out the id from the `params` object and
return that for the `+page.svelte` file to use:

```js
/** @type {import('@sveltejs/kit').Load} */

export const load = async ({ params }) => {
	const { id } = params
	return { id }
}
```

In the `+page.svelte` file I can now use the `id` to pass to the
`GetCharacter` GraphQL query to use with URQL.

```svelte
<script>
	export let data
	let { id } = data

	import { getContextClient, gql, queryStore } from '@urql/svelte'
	const characterQueryStore = queryStore({
		client: getContextClient(),
		variables: { id },
		query: gql`
			query GetCharacter($id: ID!) {
				character(id: $id) {
					name
					image
					status
					species
					location {
						name
						type
					}
					episode {
						name
					}
				}
			}
		`,
	})
</script>

<pre>{JSON.stringify($characterQueryStore, null, 2)}</pre>
```

The `export let data` is what is being passed in as props from the
`+page.js` file. I'm destructuring the `id` from the `data` object and
passing that in as a variable to the `queryStore` function.

Lastly I'm dumping out the contents of the `$characterQueryStore` to a
pre tag again to validate the data is being returned.

## Conclusion

I've used URQL to create a client that points to the Rick and Morty
[graphql endpoint]. Created a query to pass to the client to get data
from the API and render a simple list of characters from the API. Then
added file based routing to display individual character information.

That's it!

Real basic set up, but enough to get started with using URQL with
SvelteKit.

If you want to have a look at the example code for this it's over on
my [GitHub account].

<!-- Links -->

[documentation]:
	https://formidable.com/open-source/urql/docs/basics/svelte/
[post on this]: https://scottspence.com/posts/use-urql-with-svelte/
[things have changed slightly]:
	https://github.com/sveltejs/kit/discussions/5774
[rick and morty graphql api]:
	https://rickandmortyapi.com/documentation/
[graphql endpoint]: https://rickandmortyapi.com/graphql
[example code]: https://github.com/spences10/sveltekit-with-urql
[svelte context api]: https://svelte.dev/tutorial/context-api
[github account]: https://github.com/spences10/sveltekit-with-urql

<!-- Images -->

[rickandmortyapi-graphiql]:
	https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1664657798/scottspence.com/rickandmortyapi-graphiql.png
[rickandmortyapi-graphql-single-character]:
	https://res.cloudinary.com/defkmsrpw/image/upload/q_auto,f_auto/v1664658680/scottspence.com/rickandmortyapi-graphql-single-character.png
