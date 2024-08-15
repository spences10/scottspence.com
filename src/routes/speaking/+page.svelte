<script lang="ts">
  import { Head, TableOfContents } from '$lib/components'
  import { name, website } from '$lib/info'
  import {
    get_headings,
    og_image_url,
    update_toc_visibility,
  } from '$lib/utils'
  import { onMount } from 'svelte'

  export let data
  let { Copy } = data

  let end_of_copy: HTMLElement | null
  let show_table_of_contents = true
  let headings_promise: Promise<{ label: string; href: string }[]>

  onMount(() => {
    headings_promise = get_headings()
  })

  const handle_scroll = () => {
    show_table_of_contents = update_toc_visibility(end_of_copy)
  }
</script>

<svelte:window on:scroll={handle_scroll} />

<Head
  title={`Speaking - ${name}`}
  description={`A list of events where ${name} has held a workshop, a talk or spoken publicly.`}
  image={og_image_url(name, `scottspence.com`, `Scott Speaks!`)}
  url={`${website}/speaking`}
/>

{#await headings_promise}
  Loading...
{:then headings}
  {#if show_table_of_contents}
    <TableOfContents {headings} />
  {/if}
{:catch error}
  <p>Failed to load table of contents: {error.message}</p>
{/await}

<div class="all-prose">
  <Copy />
</div>

<div class="mb-5 mt-10 flex w-full flex-col" bind:this={end_of_copy}>
  <div class="divider divider-secondary"></div>
</div>
