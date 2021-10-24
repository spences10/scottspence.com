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

Once that's finished doing it's think I can change into the newly
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

[env secrets]

```svelte
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

<!-- Links -->

[features by comparison]:
  https://formidable.com/open-source/urql/docs/comparison/
[repo on github]: https://github.com/spences10/sveltekit-with-urql/
[svelte bindings in urql]:
  https://formidable.com/open-source/urql/docs/basics/svelte/
[env secrets]: https://scottspence.com/posts/sveltekit-env-secrets
