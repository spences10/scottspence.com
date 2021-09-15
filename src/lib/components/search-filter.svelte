<script>
  import PostCard from './post-card.svelte'

  export let items
  let search = ''

  $: filteredSearch = items.filter(item => {
    let title = item.title.toLowerCase()
    let tags = item?.tags
      .map(tag => tag.toLowerCase().split('-'))
      .join(' ')
      .replace(',', ' ')
    return (
      search === '' ||
      title.indexOf(search.toLowerCase()) !== -1 ||
      tags.indexOf(search.toLowerCase()) !== -1
    )
  })
</script>

<div class="mb-10 form-control">
  <label for="search" class="label">
    <span class="label-text">Search {items.length} posts...</span>
  </label>
  <input
    type="text"
    bind:value={search}
    id="search"
    placeholder="Search"
    class="input input-primary input-bordered"
  />
</div>

<ul>
  {#if filteredSearch.length === 0}
    <li>
      <p class="all-prose">
        No results for <code>{search}</code>
      </p>
    </li>
  {/if}
  {#each filteredSearch as item}
    <li>
      <PostCard post={item} />
    </li>
  {/each}
</ul>
