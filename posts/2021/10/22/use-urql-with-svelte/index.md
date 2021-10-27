---
date: 2021-10-22
title: Use URQL with Svelte
tags: ['sveltekit', 'how-to', 'svelte']
isPrivate: true
---

<script>
  import YouTube from '$lib/components/youtube.svelte'
</script>

Use the Universal React Query Library (URQL) in Svelte!

Yeah, React and Svelte! Well, not really! There are [Svelte bindings
in URQL] now! So I'm going to take a look at configuring it for use in
a Svelte project. If you're wondering if URQL is right for your
project you can check out the [features by comparison].

So, standard guide fodder now, spin up a new project and configure the
thing.

## GraphQL endpoint

So what I'm going to need is a GraphQL endpoint to query, no probs,
I'll spin up a GraphCMS project blog template and use the Content API
from that for my endpoint.

Check out the short explainer video if none of that made any sense to
you:

<YouTube youTubeId='ID8bchiyNfw'/>

## Set up the project

Time to spin up a new project, I can do that using the `npm init`
command:

```bash
npm init svelte@next sveltekit-with-urql
```

From the CLI prompts I'll pick the following options:

```bash
✔ Skeleton project
✔ Use TypeScript? › No
✔ Add ESLint for code linting? › No
✔ Add Prettier for code formatting? › Yes
```

Once that's finished doing it's thing I can change into the newly
created project (`cd`) directory and install the dependencies along
with the dependencies I'll need for URQL:

```bash
# change into newly created project directory
cd sveltekit-with-urql
# install dependencies
npm i
# install dependencies for URQL
npm i -D @urql/svelte graphql
```

Now I can start the dev server and start making the changes to use
URQL.

## URQL client

As URQL is used client side (in the browser after the page has loaded)
there's no need to use `<script context="module">` which was what
initially confused me when starting out with it!

For the URQL client I'll need to create it in a place accessable by
other pages so the most logical place (to me) is to use the client in
a Svelte layout page, I'll need to create that:

```bash
touch src/routes/'__layout.svelte'
```

I'll add in the URQL `initClient` and pass in the endpoint, you can
use a `.env` file here, if you do make sure to add `.env` to your
`.gitignore` file:

```bash
touch .env
echo .env >> .gitignore
```

As it's a publically accessible endpoint I'm not going to be too
concerned about exposing it publically with the `VITE_` variable you
can read up on hiding [env secrets] with SvelteKit for more
information.

```svelte
<!-- src/routes/__layout.svelte -->
<script>
  import { initClient } from '@urql/svelte'
  initClient({
    url: import.meta.env.VITE_GRAPHQL_URL,
  })
</script>

<main>
  <slot />
</main>

<style>
  main {
    position: relative;
    max-width: 640px;
    margin: 0 auto;
    padding: 0 20px;
  }
</style>
```

## Using the URQL client

Now I can use the client in the index page of the project to display
the results from a query, for now I'll just query for the `posts`,
`title` and `slug`, I'll define the query in a `qgl` tag as
`postsQuery` and pass that to the URQL `operationStore` then use the
URQL `query` to create a subscription for `posts`:

```svelte
<!-- src/routes/index.svelte -->
<script>
  // urql initialization
  import { gql, operationStore, query } from '@urql/svelte'
  const postsQuery = gql`
    query Posts {
      posts {
        title
        slug
      }
    }
  `
  // request policy is cache-first (default)
  const posts = operationStore(postsQuery)
  query(posts)
</script>
```

The subscription means I can use the `$` sign in front of the `posts`
variable to subscribe to changes.

I'll use some conditional rendering with Svelte to check if the posts
are fetching or if there are any errors before using the Svelte each
directive to loop through the results of the data from endpoint:

```svelte
{#if $posts.fetching}
  <p>Loading...</p>
{:else if $posts.error}
  <p>Oopsie! {$posts.error.message}</p>
{:else}
  <ul>
    {#each $posts.data.posts as post}
      <li>
        <a href={`/posts/${post.slug}`}>
          <p>{post.title}</p>
        </a>
      </li>
    {/each}
  </ul>
{/if}
```

Here's the full `src/routes/index.svelte` file:

```svelte
<script>
  // urql initialization
  import { gql, operationStore, query } from '@urql/svelte'
  const postsQuery = gql`
    query Posts {
      posts {
        title
        slug
      }
    }
  `
  // request policy is cache-first (default)
  const posts = operationStore(postsQuery)
  query(posts)
</script>

{#if $posts.fetching}
  <p>Loading...</p>
{:else if $posts.error}
  <p>Oopsie! {$posts.error.message}</p>
{:else}
  <ul>
    {#each $posts.data.posts as post}
      <li>
        <a href={`/posts/${post.slug}`}>
          <p>{post.title}</p>
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  li {
    list-style: none;
    margin-bottom: 5rem;
  }
</style>
```

Running the dev server will now give me an unordered list with the
post title and a link to the `posts` route for that slug! That doesn't
exist yet, so if you're interested in going through that then I'll add
more to that in [Building on the example].

## Conclusion

I now have URQL configured for use in a SvelteKit project 🎉

This pattern can be used for querying any GraphQL endpoint and
displaying the results on the client (the browser).

## Building on the example

So I have an index page showing me the results for a query but not
much else, so now I can add to the example I currently have to use
SvelteKit routing to display the data for a single post.

<!-- Links -->

[features by comparison]:
  https://formidable.com/open-source/urql/docs/comparison/
[repo on github]: https://github.com/spences10/sveltekit-with-urql/
[svelte bindings in urql]:
  https://formidable.com/open-source/urql/docs/basics/svelte/
[env secrets]: https://scottspence.com/posts/sveltekit-env-secrets
[building on the example]: #building-on-the-example
