---
date: 2023-01-15
title: Load markdown via endpoint in SvelteKit
tags: ['markdown', 'sveltekit']
isPrivate: false
---

I had this idea whilst working on a SvelteKit project to see if I
could use the Marked package in place of MDSveX.

So the idea was that I only need the markdown rendered so I thought
why not just load the `.md` file into a Svelte page and render the
content out with the Svelte `{@html}` directive.

**Tl;Dr**: Code over on [GitHub]

So it's a bit of a roundabout way to do it to be honest! First up,
Marked and loading Markdown files from the filesystem won't work
client side so it's not a case of whacking in the import into the
Svelte page `<script>` tags and calling it a day.

I'll need to read the Markdown file from the filesystem and then pass
that into Marked to create the HTML output.

## Scaffold a new SvelteKit project

I'll go through the process now. So, spin up a new SvelteKit project
with the `pnpm create` command:

```bash
pnpm create svelte load-markdown-vai-endpoint
```

I'll be picking the skeleton project, TypeScript and yes to all the
other options.

Then I'll want to install the Marked package:

```bash
cd load-markdown-via-endpoint
pnpm i -D marked
# pnpm will also install all the other dependencies
```

## Create markdown file

So, first up I'll want some copy to render out. I'll create a copy
folder then create a Markdown file in there:

```bash
mkdir -p src/lib/copy
# the -p flag will create a parent if it doesn't exist
touch src/lib/copy/intro.md
```

Then I'll add some copy to the Markdown file:

```md
# Hello world

Some text

## Heading 2

Some more text

1. List item 1
1. List item 2
1. List item 3

- List item 1
- List item 2
- List item 3
```

Aight! Now I can make the endpoint to load the Markdown file and pass
it into Marked.

## Create endpoint

I'll create a new folder in `src/routes` called `parse-markdown` and
then create a new `+server.ts` file in there:

```bash
mkdir src/routes/parse-markdown
touch src/routes/parse-markdown/+server.ts
```

Ok, so I have my `+server.ts` file where I want to make a `GET` so I
can fetch that data from the client.

Once I have the endpoint working I'll do the fetch of the data from
the endpoint in a `+page.ts` file (client side) once I've validated
the endpoint works.

In the `+server.ts` file I'll use the node `readFile` method for
getting the Markdown file, then import the Marked package.

Create a function to read the imported file and then return the data
as a Promise.

I can then create a `markdown` variable and assign the data from the
`getMarkdown` function to it.

Then I'll pass the `markdown` variable into the `marked` function to
give me the HTML output.

Finally, I'll return the HTML output as a `Response` object, note the
headers content type as `text/html`.

```ts
import { readFile } from 'fs'
import { marked } from 'marked'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async () => {
  const getMarkdown = () => {
    return new Promise((resolve, reject) => {
      readFile(`src/lib/copy/intro.md`, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  let markdown = (await getMarkdown()) as string
  let html = marked(markdown)

  return new Response(html, {
    headers: {
      'content-type': 'text/html',
    },
  })
}
```

Sweet! So now that I have an endpoint that should return HTML. I can
visit the endpoint in the browser
(`http://localhost:5173/parse-markdown`) and see the HTML output.

## Add query string

So, that Markdown file is a fixed file name, which isn't much use, so
what I'll do is pass the filename I want to load to the endpoint. I'll
do that by adding a `file` query string to the endpoint.

So now, in the URL bar I'll add in a query parameter:

```text
http://localhost:5173/parse-markdown?file=intro
```

Then in the `+server.ts` file I'll destructure out the `url` and use
the `url.searchParams` to `.get` the `file` parameter and use that for
the file path.

Visiting the endpoint with the query string should load the same
content now. I'm passing the file name this time to load the same file
in the query parameter.

```ts
import { readFile } from 'fs'
import { marked } from 'marked'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url }) => {
  let file = url.searchParams.get('file')

  const getMarkdown = () => {
    return new Promise((resolve, reject) => {
      readFile(`src/lib/copy/${file}.md`, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        }
        resolve(data)
      })
    })
  }

  let markdown = (await getMarkdown()) as string
  let html = marked(markdown)

  return new Response(html, {
    headers: {
      'content-type': 'text/html',
    },
  })
}
```

That's the endpoint sorted. Now I can fetch the data from the endpoint
to the client.

## Fetch data from endpoint

I'll create a new `+page.ts` file in the `routes` folder, and add a
`load` function, this will run before the `+page.svelte` file is
rendered.

I'll create the file:

```bash
touch src/routes/+page.ts
```

In the `+page.ts` file I'll create the `load` function then do a fetch
from the endpoint passing in the `file` query parameter.

I'll create a `html` variable and return that as the `data` from the
`load` function.

```ts
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch(`parse-markdown?file=intro`)
  const html = await res.text()
  return { html }
}
```

The `data` (`data.html` in this case) will now be available to the
`+page.svelte` file.

## Render HTML

So in the `+page.svelte` file I'll import the `data` and then render
out the HTML using the Svelte `@html` directive.

```svelte
<script lang="ts">
  import type { PageData } from './$types'

  export let data: PageData
</script>

<div class="prose">
  {@html data.html}
</div>
```

## Conclusion

Like I said at the start, a real roundabout way to load Markdown into
a Svelte page. But it works and it's a good way to learn about
SvelteKit and the way data loading works in SvelteKit.

<!-- Links -->

[github]: https://github.com/spences10/load-markdown-via-endpoint
