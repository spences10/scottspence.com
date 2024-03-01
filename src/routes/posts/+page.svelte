<script lang="ts">
  import { page } from '$app/stores'
  import { Head, PostCard } from '$lib/components'
  import { description, name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { posts } = data

  let search_query = $page.url.searchParams.get('search') || ''

  $: filtered_posts = posts.filter((post: Post) => {
    if (post.isPrivate) return false

    if (search_query === '') return true

    return (
      post.title.toLowerCase().includes(search_query.toLowerCase()) ||
      (Array.isArray(post.tags) &&
        post.tags.some(tag =>
          tag.toLowerCase().includes(search_query.toLowerCase()),
        )) ||
      post.preview.toLowerCase().includes(search_query.toLowerCase())
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
