---
date: 2022-05-13
title: GraphQL Code Generator with SvelteKit and TypeScript Example
tags: ['typescript', 'svelte', 'sveltekit', 'graphql', 'guide']
isPrivate: true
---

I've started using TypeScript on every new project I start with
Svelte. My buddy Jamie Barton has helped me out with getting set up
with the GraphQL Code Generator so that data is typed in the project.

In this guide I'll be setting up a SvelteKit skeleton project with a
GraphCMS backend to demonstrate how to set up with GraphQL Code Gen.
I'll be using the GraphCMS Blog Starter template in the examples here.
You can generate your own from the starter section on the
`app.graphcms.com` page of clone the project I'm using [with this
link].

## Setup SvelteKit project

Usual fare with this, use the CLI to create a new project. So from the
command line I'll scaffold out a new SvelteKit skeleton project. One
thing to note is that the `@next` isn't needed anymore, this
**doesn't** mean that SvelteKit is at v1 though like I have said in
the past.

```bash
npm init svelte sveltekit-graphql-codegen
```

I'll chose the following options from the CLI prompt, yes to all the
things:

```text
✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … Yes
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … Yes
```

I'll change directory (`cd`) into the newly created project and I'll
install `graphql-request` and `graphql` as regular dependencies. I've
seen peer dependency issues and GraphQL Code Generator flat out
doesn't work if they're installed as dev dependencies for some reason.

Yes, I'm using `pnpm` for the installation of the dependencies, you do
you though, use `npm`, `yarn`, whatever, live your life!

```bash
pnpm i graphql-request graphql@15.0.0
```

I'll then install the dev dependencies needed, I'll list them here and
you can copy them from the code block below if you need it!

- `@graphql-codegen/cli`
- `@graphql-codegen/typescript`
- `@graphql-codegen/typescript-operations`
- `@graphql-codegen/typed-document-node`
- `@graphql-typed-document-node/core`

```bash
pnpm i -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typed-document-node @graphql-typed-document-node/core
```

## Setup GraphQL Code Generator

Now that I've got all the dependencies I need I'll need to configure
GraphQL Code Generator.

```bash
touch codegen.yml .env
```

I'm also creating a `.env` file to store the `VITE_GRAPHQL_API` that's
going to store the endpoint of my GraphQL API as I'm not a fan of
hardcoding anything that can be a variable.

In the `codegen.yml` file I'll add the following:

```yaml
schema: ${VITE_GRAPHQL_API}
documents:
  - '**/*.{graphql,gql}'
generates:
  src/lib/graphql/types.ts:
    plugins:
      - typescript
      - typescript-operations
      - typed-document-node
```

The `codegen.yml` file here is telling the GraphQL Code Generator to
create the `types.ts` file in the `src/lib/graphql` folder. It will
run the `plugins` of `typescript`, `typescript-operations` and
`typed-document-node` against the `schema` for any `documents`
(GraphQL files) matching `**/*.{graphql,gql}`.

Now the GraphQL Code Generator is going to look for a `.graphql` or
`.gql` file, so I'll create a `all-posts.graphql` file that will query
for all the posts.

```bash
# make the directory
mkdir -p src/lib/graphql
# create the file
touch src/lib/graphql/all-posts.graphql
```

I'll add the following to the `all-posts.graphql` file:

```graphql
query AllPosts {
  posts {
    title
    slug
    date
    excerpt
    tags
  }
}
```

In my `.env` file I'll add the endpoint of my GraphQL API, I'm using a
GraphCMS project.

```bash
VITE_GRAPHQL_API=https://api-eu.graphcms.com/v2/project-id/master
```

I'll need to let the GraphQL Code Generator know where to get the
config for the variable I'm using in the `.yml` file. I'll do that
with creating a `generate` script in the `package.json` file.

I'll also tack on the `generate` script at the end of the `prepare`
script so that if there's any changes to the `.graphql` files it'll
run the `generate` script after `pnpm install` has run.

```json
"scripts": {
  "generate": "graphql-codegen --require dotenv/config",
  "prepare": "svelte-kit sync && pnpm run generate",
}
```

Ok now I'm ready to go! Run the `generate` script and I get the
following CLI output:

```text
> graphql-codegen --require dotenv/config

  ✔ Parse configuration
  ❯ Generate outputs
  ✔ Parse configuration
  ✔ Generate outputs
```

Now I can go over to the `src/lib/graphql` folder and I can see the
`types.ts` file has been generated.

```svelte
<script context="module" lang="ts">
  import {
    AllPostsDocument,
    type AllPostsQuery,
    type AllPostsQueryVariables,
    type Post,
  } from '$lib/graphql/types'
  import { GraphQLClient } from 'graphql-request'

  export const load = async () => {
    const client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_API)

    const { posts } = (await client.request<
      AllPostsQuery,
      AllPostsQueryVariables
    >(AllPostsDocument)) as { posts: Post[] }

    return { props: { posts } }
  }
</script>

<script lang="ts">
  export let posts: Post[]
</script>

<pre>{JSON.stringify(posts, null, 2)}</pre>
```

<!-- Links -->

[with this link]:
  https://app.graphcms.com/clone/e80893d4401a4e3685eed0e5ea4484ef?name=New%20Blog%20Template
