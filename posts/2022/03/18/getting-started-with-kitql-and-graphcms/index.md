---
date: 2022-03-18
title: Getting Started with KitQL and GraphCMS
tags: ['svelte', 'sveltekit', 'graphql', 'graphcms']
isPrivate: true
---

KitQL is a GraphQL client for Svelte. It is a simple way to query
GraphQL APIs. I've been using it in a couple of projects now and want
to share what I have learned. What better wat to do that than the
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

Then there's the `sveltekit.config.js` file. In here I'll need to add
and configure the `vite-plugin-watch-and-run`, take note here if
you're not using `pnpm` you'll need to change the `run` command.

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

Now that `pnpm run gen` is being called I'll need to add it to the
scripts in the `package.json` file.

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
parent folders as well.

```bash
mkdir src/lib/graphql/_kitql -p
```

In the `src/lib/graphql` folder I'll create a `all-posts.gql` file:

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

## Additional config for Tailwind

If you're follwing along and you're not into Tailwind you can skip the
next bit.

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
    extend: {},
  },

  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

module.exports = config
```

## Create KitQL client

```bash
touch src/lib/graphql/kitQLClient.ts
```

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

<!-- Links -->

[graphql code generator]: https://www.graphql-code-generator.com/
[graphql vs code extension]:
  https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql
[explanation video for setting up kitql]:
  https://www.youtube.com/watch?v=6pH4fnFN70w
[jyc]: https://twitter.com/jycouet
[kitql all-in]:
  https://github.com/jycouet/kitql/tree/main/packages/all-in
