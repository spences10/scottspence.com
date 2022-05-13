---
date: 2022-05-13
title: GraphQL Code Generator with SvelteKit and TypeScript Example
tags: ['typescript', 'svelte', 'sveltekit', 'graphql']
isPrivate: true
---

I've started using TypeScript on every new project I start with
Svelte. My buddy Jamie Barton has helped me out with getting set up
with the GraphQL Code Generator so that data is typed in the project.

## Setup SvelteKit project

Usual fare with this, use the CLI to create a new project. So from the
command line I'll scaffold out a new SvelteKit skeleton project. One
thing to note is that the `@next` isn't needed anymore, this doesn't
mean that SvelteKit is at v1 though like I have said in the past.

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

I'll need to install the following dependencies, I'll list them here
and you can copy them from the code block below if you need it!

- `@graphql-codegen/cli`
- `@graphql-codegen/typescript`
- `@graphql-codegen/typescript-operations`
- `@graphql-codegen/typed-document-node`
- `@graphql-typed-document-node/core`

I'm using `pnpm` for the installation of these _dev_ dependencies, you
do you, `npm`, `yarn`, live your life!

```bash
pnpm i -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typed-document-node @graphql-typed-document-node/core
```

I'll install `graphql-request` and `graphql` as regular dependencies
as I've seen peer dependency issues and GraphQL Code Generator flat
out doesn't work if they're installed as dev dependencies for some
reason.

```bash
pnpm i graphql-request graphql
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

In my `.env` file I'll add the endpoint of my GraphQL API.

```bash
VITE_GRAPHQL_API=https://api-eu.graphcms.com/v2/project-id/master
```

## Setup with KitQL

```ts
import.meta.env.VITE_GRAPHQL_API
```

```json
 --require dotenv/config
```
