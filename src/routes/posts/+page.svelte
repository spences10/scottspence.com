<script lang="ts">
  import { Head } from '$lib/components'
  import PostCard from '$lib/components/post-card.svelte'
  import { description, name, website } from '$lib/info.js'
  import { og_image_url } from '$lib/utils'
  import type { Post } from '../../types'

  export let data
  let { posts } = data

  let search_query = ''

  $: filtered_posts = posts.filter((post: Post) => {
    if (post.isPrivate) return false

    if (search_query === '') return true

    return (
      post.title.toLowerCase().indexOf(search_query.toLowerCase()) !==
        -1 ||
      post.tags.find(
        (tag: string) =>
          tag.toLowerCase() === search_query.toLowerCase()
      ) ||
      post.preview
        .toLowerCase()
        .indexOf(search_query.toLowerCase()) !== -1
    )
  })
</script>

<Head
  title={`Welcome! - ${name}`}
  {description}
  image={og_image_url(name, `scottspence.com`, `Thoughts Pamphlet`)}
  url={`${website}/posts`}
/>

<div class="mb-10 form-control">
  <label for="search" class="label">
    <span class="label-text">
      Search {filtered_posts.length} posts...
    </span>
  </label>
  <input
    data-testid="search"
    id="search"
    class="input input-primary input-bordered"
    type="text"
    placeholder="Search..."
    bind:value={search_query}
  />
</div>

{#each filtered_posts as post (post.slug)}
  <PostCard {post} />
{/each}
