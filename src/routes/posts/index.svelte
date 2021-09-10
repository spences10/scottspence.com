<script context="module">
  export const prerender = true

  import Head from '$lib/components/head.svelte'
  import PostCard from '$lib/components/post-card.svelte'
  import { getPosts } from '$lib/get-posts'
  import { description, name, website } from '$lib/info.js'
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
    keys: ['title', 'tags', 'preview'],
    includeScore: true,
    includeMatches: true,
    threshold: 0.4,
  }
  let fuse = new Fuse(posts, options)
  let query = ''
  $: results = fuse.search(query)
</script>

<Head
  title={`Welcome! · ${name}`}
  {description}
  image={ogImageUrl(name, `scottspence.com`, `Thoughts Pamphlet`)}
  url={`${website}/posts`}
/>

<div class="flex flex-col flex-grow">
  <h1 class="font-bold mb-5 text-5xl">Posts</h1>
  <div class="">
    <div class="mb-10 form-control">
      <label for="search" class="label">
        <span class="label-text">Search {posts.length} posts...</span>
      </label>
      <input
        type="text"
        bind:value={query}
        id="search"
        placeholder="Search"
        class="input input-primary input-bordered"
      />
    </div>

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
