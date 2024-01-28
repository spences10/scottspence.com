---
date: 2024-01-28
title: SvelteKit and Fathom Svelte 5 Integration
tags: ['analytics', 'svelte', 'sveltekit', 'fathom']
isPrivate: false
---

This is a post that will go over some of the specifics needed to
configure a SvelteKit project using Svelte 5 runes. So this is a
dedicated post for the Svelte 5 integration going over the work done
in previous posts on setting up a project to use Fathom Analytics. If
you want the implementation details for SvelteKit v1 and Svelte 4,
check out the posts.

You can see the demo site over at: https://ideal-memory.com

The code is here: https://github.com/spences10/sveltekit-and-fathom

For specifics on using the Fathom API I suggest taking a look a the
previous posts:

- [Adding real-time analytics to my SvelteKit site with Fathom](https://scottspence.com/posts/caching-with-fathom-redis-and-sveltekit)
- [Caching with Fathom, Redis, and SvelteKit](https://scottspence.com/posts/adding-real-time-analytics-to-my-sveltekit-site-with-fathom)
- [and also the Fathom documentation](https://usefathom.com/api)

## Svelte 4 to Svelte 5 layout changes

I got this working on my site first of all before implementing here,
essentially the changes for Fathom to work is to swap out the
`onMount` function for a `$effect` function. Then another effect to
track the pageview on route change.

Here's the Svelte 4 layout:

```svelte
<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import {
    PUBLIC_FATHOM_ID,
    PUBLIC_FATHOM_URL,
  } from '$env/static/public'
  import Nav from '$lib/components/nav.svelte'
  import * as Fathom from 'fathom-client'
  import { onMount } from 'svelte'
  import '../app.css'
  import type { PageData } from './$types'

  export let data: PageData

  onMount(async () => {
    Fathom.load(PUBLIC_FATHOM_ID, {
      url: PUBLIC_FATHOM_URL,
    })
  })

  $: $page.url.pathname, browser && Fathom.trackPageview()
</script>

<Nav visitors={data?.visitors?.total || 0} />
<main class="container mx-auto mb-20 max-w-3xl px-4">
  <slot />
</main>
```

And here's the Svelte 5 layout:

```svelte
<script lang="ts">
  import { browser } from '$app/environment'
  import { page } from '$app/stores'
  import { env } from '$env/dynamic/public'
  import { Nav } from '$lib/components'
  import * as Fathom from 'fathom-client'
  import type { Snippet } from 'svelte'
  import '../app.css'
  import type { LayoutData } from './$types'

  const { PUBLIC_FATHOM_ID, PUBLIC_FATHOM_URL } = env

  let { data, children } = $props<{
    data: LayoutData
    children: Snippet
  }>()

  $effect(() => {
    if (browser) {
      Fathom.load(PUBLIC_FATHOM_ID, {
        url: PUBLIC_FATHOM_URL,
      })
    }
  })

  // Track pageview on route change
  $effect(() => {
    $page.url.pathname, browser && Fathom.trackPageview()
  })
</script>

<Nav visitors={data?.visitors?.total || 0} />
<main class="container mx-auto mb-20 max-w-3xl px-4">
  {@render children()}
</main>
```

So, I'll go over the changes then show the diff.

I'm using `$env/dynamic/public` instead of `$env/static/public` I've
had issues with the static env vars not being available in the
browser, so I'm using the dynamic env vars instead and destructuring
the values I need.

Using the `$props` rune to get the `data` and `children` props instead
of having them passed with `export let`. The `children` prop is a
snippet that is passed to the layout, this is the content of the page
that is being rendered. No more `<slot />`!

The `onMount` function is swapped out for a `$effect` rune. This is
wrapped in a conditional that checks if the browser is available and
loads up the Fathom script.

Then another `$effect` for the `Fathom.trackPageview` function, that
tracks the pageview on route change.

```diff
diff --git a/src/routes/+layout.svelte b/src/routes/+layout.svelte
index 0c9da2c..cb4f77d 100644
--- a/src/routes/+layout.svelte
+++ b/src/routes/+layout.svelte
@@ -2,24 +2,34 @@
 	import { browser } from '$app/environment'
 	import { page } from '$app/stores'
 	import { env } from '$env/dynamic/public'
-	import Nav from '$lib/components/nav.svelte'
+	import { Nav } from '$lib/components'
 	import * as Fathom from 'fathom-client'
-	import { onMount } from 'svelte'
+	import type { Snippet } from 'svelte'
 	import '../app.css'
-	import type { PageData } from './$types'
+	import type { LayoutData } from './$types'

-	export let data: PageData
+	const { PUBLIC_FATHOM_ID, PUBLIC_FATHOM_URL } = env

-	onMount(async () => {
-		Fathom.load(env.PUBLIC_FATHOM_ID, {
-			url: env.PUBLIC_FATHOM_URL,
-		})
+	let { data, children } = $props<{
+		data: LayoutData
+		children: Snippet
+	}>()
+
+	$effect(() => {
+		if (browser) {
+			Fathom.load(PUBLIC_FATHOM_ID, {
+				url: PUBLIC_FATHOM_URL,
+			})
+		}
 	})

-	$: $page.url.pathname, browser && Fathom.trackPageview()
+	// Track pageview on route change
+	$effect(() => {
+		$page.url.pathname, browser && Fathom.trackPageview()
+	})
 </script>

 <Nav visitors={data?.visitors?.total || 0} />
 <main class="container mx-auto mb-20 max-w-3xl px-4">
-	<slot />
+	{@render children()}
 </main>
```

That's pretty much it! For the Fathom integration anyway.

The rest of the changes were to use Svelte 5 snippets for the
Analytics Card.

## Conculsion

Simple enough, right? There were a few bumps for me on using `$effect`
for the first loading of the Fathom script, then another one for the
pageview tracking. But once I got my head around it, it was pretty
straight forward.

For the rest of the changes, I'll leave that to you to check out in
the repo.
