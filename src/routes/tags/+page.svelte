<script lang="ts">
  import { Head } from '$lib/components'
  import { description, name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { tags, posts_by_tag } = data

  let query = ''

  $: filtered_tags = tags.filter((tag: string) => {
    if (query === '') return true
    return tag.toLowerCase().includes(query.toLowerCase())
  })
</script>

<Head
  title={`Posts by tag - ${name}`}
  {description}
  image={og_image_url(name, `scottspence.com`, `Tags`)}
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

<ul class="flex flex-wrap justify-start mb-20">
  {#each filtered_tags as tag (tag)}
    <li class="my-4 text-xl">
      <a
        class="mr-6 transition link hover:text-primary"
        href={`tags/${tag}`}
      >
        {tag} ({posts_by_tag[tag].length})
      </a>
    </li>
  {/each}
</ul>
