---
date: 2021-09-20
title: Fetch data from two or more endpoints in SvelteKit
tags: ['svelte', 'sveltekit']
isPrivate: false
---

Real quick example of how I used `Promise.all` to fetch data from
multiple endpoints in SvelteKit.

This uses the server side `fetch` that is part of SvelteKit and is
destructured into the `load` function.

Note that the code is in the `<script context="module">` tag, this
means it runs before the page is loaded.

```svelte
<script context="module">
  export async function load({ fetch }) {
    const [pagesReq, postsReq] = await Promise.all([
      fetch('/pages.json'),
      fetch('/posts.json'),
    ])
    if (pagesReq.ok && postsReq.ok) {
      const { pages } = await pagesReq.json()
      const { posts } = await postsReq.json()
      return {
        props: {
          pages,
          posts,
        },
      }
    }
  }
</script>
```

Full file looks a little like this example:

```svelte
<!-- src/routes/index.svelte -->
<script context="module">
  export async function load({ fetch }) {
    const [pagesReq, postsReq] = await Promise.all([
      fetch('/pages.json'),
      fetch('/posts.json'),
    ])
    if (pagesReq.ok && postsReq.ok) {
      const { pages } = await pagesReq.json()
      const { posts } = await postsReq.json()
      return {
        props: {
          pages,
          posts,
        },
      }
    }
  }
</script>

<script>
  import PagesList from '$lib/nav.svelte'
  export let pages, posts
</script>

<PagesList {pages} />

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the
  documentation
</p>

{#each posts as { title, slug, excerpt }}
  <a href={`/posts/${slug}`}>
    <p>{title}</p>
    <p>{excerpt}</p>
  </a>
{/each}
```

That's it!
