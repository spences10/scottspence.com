<script>
  import PostCard from './post-card.svelte'

  export let items
  let search = ''

  $: filteredSearch = items.filter(item => {
    let title = item.title.toLowerCase()
    let tags = item.tags
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

<label for="">
  Search <br />
  <input
    class="input input-primary input-bordered"
    bind:value={search}
    type="text"
    placeholder="Search"
  />
</label>

<ul>
  {#each filteredSearch as item}
    <li>
      <PostCard post={item} />
    </li>
  {/each}
</ul>
