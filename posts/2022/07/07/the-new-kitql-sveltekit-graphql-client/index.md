---
date: 2022-07-05
title: The new KitQL SvelteKit GraphQL client
tags: ['svelte', 'sveltekit', 'kitql', 'houdini', 'graphql']
isPrivate: true
---

The latest version of KitQL dropped yesterday!

## Get set up

```bash
# install dependencies
pnpm i @kitql/all-in graphql
# make folders for config
mkdir -p src/lib/graphql/operations
# create config files
touch {houdini.config.js,.graphqlrc.yaml} src/lib/graphql/client.ts
```

Set up GraphQL:

```yaml
# Typical File for extension: vscode-graphql & CodeGen!
projects:
  default:
    schema:
      - https://rickandmortyapi.com/graphql
        # headers:
        #   Authorization: 'Bearer ${TOKEN}'
      - ./$houdini/graphql/schema.gql
    documents:
      - '**/*.gql'
      - ./$houdini/graphql/documents.gql
```

Set up the Client:

```ts
import type { RequestHandlerArgs } from '$houdini'
import { HoudiniClient } from '$houdini'

async function fetchQuery({
  fetch,
  text = '',
  variables = {},
  session,
  metadata,
}: RequestHandlerArgs) {
  const url =
    import.meta.env.VITE_GRAPHQL_ENDPOINT ||
    'https://rickandmortyapi.com/graphql'

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: text,
      variables,
    }),
  })

  return await result.json()
}

export const houdiniClient = new HoudiniClient(fetchQuery)
```
