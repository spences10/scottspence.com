<script context="module">
  export const prerender = true

  export const load = async () => {
    const posts = Object.entries(
      import.meta.globEager('/posts/**/*.md')
    )
      // get post metadata
      .map(([, post]) => post.metadata)
      // sort by date
      .sort((b, a) => {
        const da = new Date(a.date).getTime()
        const db = new Date(b.date).getTime()
        if (da < db) return -1
        if (da === db) return 0
        if (da > db) return 1
      })

    return {
      props: {
        posts,
      },
    }
  }
</script>

<script>
  import PostCard from '$lib/components/post-card.svelte'
  import { name } from '$lib/info.js'
  import Fuse from 'fuse.js'

  export let posts

  let options = {
    keys: ['title', 'tags', 'preview', 'previewHtml'],
    includeScore: true,
    includeMatches: true,
    threshold: 0.2,
  }
  let fuse = new Fuse(posts, options)
  let query = ''
  $: results = fuse.search(query)
</script>

<svelte:head>
  <title>{name}</title>
</svelte:head>

<div class="flex flex-col flex-grow">
  <div
    class="flex-grow divide-y divide-gray-300 dark:divide-gray-700"
  >
    <input type="text" bind:value={query} class="border" />

    {#if results.length === 0}
      {#each posts as post}
        {#if !post.isPrivate}
          <PostCard {post} />
        {/if}
      {/each}
    {:else}
      {#each results as { item }}
        {#if !item.isPrivate}
          <PostCard post={item} />
        {/if}
      {/each}
    {/if}
  </div>
</div>
