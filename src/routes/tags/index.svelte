<script context="module">
  export const prerender = true

  import Head from '$lib/components/head.svelte'
  import { getPostTags } from '$lib/get-post-tags'
  import { description, name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'
  import Fuse from 'fuse.js'

  export async function load() {
    const { tags, postsByTag } = await getPostTags()
    return {
      props: {
        tags,
        postsByTag,
      },
    }
  }
</script>

<script>
  export let tags
  export let postsByTag

  let options = {
    keys: ['title', 'tags', 'preview'],
    includeScore: true,
    includeMatches: true,
    threshold: 0.4,
  }
  let fuse = new Fuse(tags, options)
  let query = ''
  $: results = fuse.search(query)
</script>

<Head
  title={`Posts by tag · ${name}`}
  {description}
  image={ogImageUrl(name, `scottspence.com`, `Tags`)}
  url={`${website}/tags`}
/>

<h1 class="font-bold mb-5 text-5xl">Posts by Tag</h1>

<div class="mb-10 form-control">
  <label for="search" class="label">
    <span class="label-text">Search tags...</span>
  </label>
  <input
    type="text"
    bind:value={query}
    id="search"
    placeholder="Search"
    class="input input-primary input-bordered"
  />
</div>

<ul class="flex flex-wrap justify-start">
  {#if results.length === 0 && query.length === 0}
    {#each tags as tag}
      <li class="my-4 text-xl">
        <a
          class="mr-6 transition link hover:text-primary"
          sveltekit:prefetch
          href={`tags/${tag}`}>{tag} ({postsByTag[tag].length})</a
        >
      </li>
    {/each}
  {:else}
    {#each results as { item }}
      <li class="my-4 text-xl">
        <a
          class="mr-6 transition link hover:text-primary"
          sveltekit:prefetch
          href={`tags/${item}`}>{item} ({postsByTag[item].length})</a
        >
      </li>
    {/each}
  {/if}
</ul>
