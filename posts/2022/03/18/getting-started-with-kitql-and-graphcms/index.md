---
date: 2022-03-18
title: Getting Started with KitQL and GraphCMS
tags: ['svelte', 'sveltekit', 'graphql', 'graphcms']
isPrivate: true
---

KitQL is a GraphQL client for Svelte. It is a set of tools to help you
query GraphQL APIs. I've been using it in a couple of projects now and
want to share what I have learned. What better wat to do that than the
(now) classic re-reaction of the GraphCMS blog template with
SvelteKit.

First up I want to thank the creator of KitQL for his work. Jean-Yves
Couët (or [JYC]) has done a great job with KitQL and the additional
tooling he's created for use in SvelteKit.

He's also done a great introductory video over on YouTube with an
[explanation video for setting up KitQL]. The API has changed a bit
since the video so I'll go over how to use that here.

## What's in the box?

KitQL uses the [GraphQL Code Generator] to generate typed queries,
mutations and subscriptions. This means that you can use the built in
VS Code intellisense to find fields in queries.

## Let's get set up!

If you haven't got the [GraphQL VS Code extension] mentioned in JYC's
video installed go install that for the ability to run queries in VS
Code.

I have a couple of other projects with this naming convention
`x-with-sveltekit-and-graphcms` where `x` is the GraphQL client being
used. So the projects are identical bar the client used and in this
case with KitQL being a TypeScript tool I'll be using TypeScript in
place of JavaScript.

## Create a new project

I'll start by creating the project with the `npm init` command and
pick the follwing options:

```text
➜ npm init svelte@next kitql-with-sveltekit-and-graphcms

✔ Which Svelte app template? › Skeleton project
✔ Use TypeScript? … Yes
✔ Add ESLint for code linting? … Yes
✔ Add Prettier for code formatting? … Yes
✔ Add Playwright for browser testing? … Yes
```

I'll follow the rest of the steps from the CLI output to get set up!

```text
Next steps:
  1: cd kitql-with-sveltekit-and-graphcms
  2: npm install (or pnpm install, etc)
  3: git init && git add -A && git commit -m "Initial commit" (optional)
  4: npm run dev -- --open
```

I'm using `pnpm` in these examples.

Create a `.env` file for my GraphCMS content API endpoint.

```bash
touch .env
```

## Install dependencies and configure

Then I'll need to install KitQL and the JavaScript implementation of
GraphQL.

```bash
pnpm i -D @kitql/all-in graphql
```

Create a `.graphqlrc.yaml` file:

```bash
touch .graphqlrc.yaml
```

I've taken the config for the file here from the [KitQL all-in] docs.
To be able to do code gen on this there needs to be a schema for use
in the `.graphqlrc.yaml` file. The schema can be either a local file
or a remote URL, I'm pointing this to the public content API of the
GraphCMS blog template.

```yaml
projects:
  default:
    schema: https://api.graphcms.com/v2/projectid/master
    documents:
      - '**/*.gql'
    extensions:
      endpoints:
        default:
          url: https://api.graphcms.com/v2/projectid/master
      codegen:
        generates:
          ./src/lib/graphql/_kitql/graphqlTypes.ts:
            plugins:
              - typescript
              - typescript-operations
              - typed-document-node
              - typescript-document-nodes

          ./src/lib/graphql/_kitql/graphqlStores.ts:
            plugins:
              - '@kitql/graphql-codegen'
            config:
              importBaseTypesFrom: $lib/graphql/_kitql/graphqlTypes

        config:
          useTypeImports: true
```

Then, there's the `sveltekit.config.js` file. In here I'll need to add
and configure the `vite-plugin-watch-and-run`, take note here if
you're not using `pnpm` you'll need to change the `run` command.

This plugin is really handy, with this configuration it will watch for
any changes to GraphQL files and then run a `npm` script.

```js
import watchAndRun from '@kitql/vite-plugin-watch-and-run'
import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    vite: {
      plugins: [
        watchAndRun([
          {
            watch: '**/*.(gql|graphql)',
            run: 'pnpm run gen',
          },
        ]),
      ],
    },
  },
}

export default config
```

Now that `pnpm run gen` is added to `vite-plugin-watch-and-run` and
being called each time there's a change to any GraphQL files, I'll
need to add it to the scripts in the `package.json` file.

```json
"scripts": {
  "prepare": "pnpm run gen",
  "dev": "svelte-kit dev --port 3777",
  "gen": "graphql-codegen --config ./.graphqlrc.yaml",
},
```

Because I'm using `pnpm` I'll also need to amend the `.npmrc` file:

```diff
-engine-strict=true
+save-exact=true
+node-linker=hoisted
```

Alright! Nearly done!

If I run the dev script (`pnpm run dev`) command now (which will call
the `gen` script with `vite-plugin-watch-and-run`) I'll get some error
output from `graphql-codegen` because I've not created any GraphQL
queries!

I'll create that folder structure now, note the `-p` flag will create
parent folders as well. So this command creates the `lib`, `graphql`
and `_kitql` folders.

```bash
mkdir src/lib/graphql/_kitql -p
```

In the `src/lib/graphql` folder I'll create an `all-posts.gql` file,
this is to list all the posts in the blog on the index page:

```gql
query AllPosts {
  posts {
    title
    slug
    date
    excerpt
    tags
    coverImage {
      url(
        transformation: {
          image: { resize: { fit: clip, height: 369, width: 656 } }
        }
      )
    }
  }
}
```

Now with the dev script running `vite-plugin-watch-and-run` will do
it's thing and run the `gen` script. This creates the
`graphqlStores.ts` and `graphqlTypes.ts` files in the `_kitql` folder.

Taking a look at the `graphqlStores.ts` file now I can see that there
is a function for `KQL_AllPostsStore()` which exports `KQL_AllPosts`.

The function has all the methods on it I'll need for working with the
data.

## Additional config for Tailwind

The rest of the code examples will be using Tailwind. If you're
follwing along and you're not into Tailwind you can skip this bit.

```bash
# install and config tailwind
npx svelte-add@latest tailwindcss
# add typography and daisyUI
pnpm i -D @tailwindcss/typography daisyui
```

The Typography and daisyUI plugins are added to the
`tailwind.config.cjs` file:

```js
const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: null,
          },
        },
      },
    },
  },

  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

module.exports = config
```

## Create KitQL client

Now I can create the KitQL client to start querying data. Create the
`.ts` file for it first:

```bash
touch src/lib/graphql/kitQLClient.ts
```

Then I'll add the following configuration to the `kitQLClient.ts`
file:

```ts
import { KitQLClient } from '@kitql/client'
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_API

export const kitQLClient = new KitQLClient({
  url: GRAPHQL_ENDPOINT as string,
  credentials: 'omit',
  headersContentType: 'application/json',
  logType: ['client', 'server', 'operationAndvariables'],
})
```

## Use queried data from `graphqlStores`

Now for the home page (`src/routes/index.svelte`) I can use the
`KQL_AllPosts` store and use the `query` method.

In a SvelteKit load function I can `await` the query for `AllPosts`
and return an empty object from the load function. It's empty because
once the data has been fetched before the page loads it's added to a
Svelte store for use in the page.

```svelte
<script lang="ts" context="module">
  import { KQL_AllPosts } from '$lib/graphql/_kitql/graphqlStores'

  export const load = async ({ fetch }) => {
    await KQL_AllPosts.query({ fetch })
    return {}
  }
</script>
```

Once the page has loaded I can subscribe to the `KQL_AllPosts` store
to get the data.

```svelte
<script lang="ts">
  let posts = $KQL_AllPosts.data?.posts
</script>
```

I an now use that in a Svelte each expression to render the posts.

```svelte
{#each posts as { title, slug, excerpt, coverImage, tags }}
  <div class="card text-center shadow-2xl mb-20">
    <figure class="">
      <img
        class=""
        src={coverImage.url}
        alt={`Cover image for ${title}`}
      />
    </figure>
    <div class="card-body prose">
      <h2 class="title">{title}</h2>
      <p>{excerpt}</p>
      <div class="flex justify-center mb-5 space-x-2">
        {#each tags as tag}
          <span class="badge badge-primary">{tag}</span>
        {/each}
      </div>
      <div class="justify-center card-actions">
        <a
          sveltekit:prefetch
          href={`/posts/${slug}`}
          class="btn btn-outline btn-primary">Read &rArr;</a
        >
      </div>
    </div>
  </div>
{/each}
```

<!-- Links -->

[graphql code generator]: https://www.graphql-code-generator.com/
[graphql vs code extension]:
  https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql
[explanation video for setting up kitql]:
  https://www.youtube.com/watch?v=6pH4fnFN70w
[jyc]: https://twitter.com/jycouet
[kitql all-in]:
  https://github.com/jycouet/kitql/tree/main/packages/all-in
