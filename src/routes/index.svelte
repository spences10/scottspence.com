<script context="module">
  export const prerender = true

  import Head from '$lib/components/head.svelte'
  import PostCard from '$lib/components/post-card.svelte'
  import { getPosts } from '$lib/get-posts'
  import { description, name } from '$lib/info.js'
  import { ogImageUrl } from '$lib/og-image-url-build'
  import Fuse from 'fuse.js'

  export const load = async () => {
    const posts = await getPosts()

    return {
      props: {
        posts,
      },
    }
  }
</script>

<script>
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

<Head
  title={`Welcome! · ${name}`}
  {description}
  image={ogImageUrl({ name }, 'scottspence.com', { name })}
/>

<div class="flex flex-col flex-grow">
  <div
    class="flex-grow divide-y divide-gray-300 dark:divide-gray-700"
  >
    <input type="text" bind:value={query} class="border" />

    {#if results.length === 0 && query.length === 0}
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

<!-- `<article class="py-8 first:pt-0">
  <div>
    <span>😅</span>
    No results found for <code>{query}</code>
  </div>
</article>` -->
