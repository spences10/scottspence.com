---
date: 2023-02-25
title: Passing SvelteKit +page.server.ts data to +page.ts
tags: ['sveltekit', 'resource', 'how-to']
isPrivate: false
---

I came across this issue when adding [real-time analytics to my site],
essentially what I wanted to do was get some analytics data from a
server endpoint and pass that to the page.

In SvelteKit you can have different ways to get data onto a page,
[which I've detailed it in the past], what I didn't cover then was
what do you do when you have both a `+page.server.ts` and a `+page.ts`
file returning data.

The `+page.server.ts` will run first then then pass anything down to
the `+page.ts` (child) file, let's look at a super simple example.
I'll have a `+page.server.ts` and a `+page.ts` files that both return
the some data.

First the `+page.server.ts` file:

```ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  return {
    page_server_data: { message: 'hello world' },
  }
}
```

Then the `+page.ts` file:

```ts
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent, data }) => {
  await parent()
  let { page_server_data } = data
  return {
    page_server_data,
    page_data: { message: 'hello world' },
  }
}
```

In the `+page.ts` file we can access the `data` and the `parent` the
(`+page.server.ts` file) then await the `parent` to get the data from
the `+page.server.ts` file.

On the `+page.svelte` file we can access the data from both files:

```svelte
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<pre>{JSON.stringify(data, null, 2)}</pre>
```

Output:

```json
{
  "page_server_data": {
    "message": "hello world"
  },
  "page_data": {
    "message": "hello world"
  }
}
```

This is the same approach if you're doing this with a
`+layout.server.ts` and `+layout.ts` files.

Hope this helps anyone who comes across this.

<!-- Links -->

[real-time analytics to my site]:
  https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom/
[which I've detailed it in the past]:
  https://scottspence.com/posts/data-loading-in-sveltekit#two-or-more-endpoints
