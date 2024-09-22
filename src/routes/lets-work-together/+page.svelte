<script lang="ts">
  import { TableOfContents } from '$lib/components'
  import { name, website } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import {
    get_headings,
    og_image_url,
    update_toc_visibility,
  } from '$lib/utils'
  import { Head } from 'svead'
  import { onMount } from 'svelte'
  import {
    exchange_rates_store,
    pricing_numbers_store,
  } from './stores'

  export let data
  let { Copy, exchange_rates, pricing_numbers } = data

  if (pricing_numbers) {
    $pricing_numbers_store = pricing_numbers
  }
  $exchange_rates_store = exchange_rates

  let end_of_copy: HTMLElement | null
  let show_table_of_contents = true
  let headings_promise: Promise<{ label: string; href: string }[]>

  onMount(() => {
    headings_promise = get_headings()
  })

  const handle_scroll = () => {
    show_table_of_contents = update_toc_visibility(end_of_copy)
  }

  const seo_config = create_seo_config({
    title: `Let's work together! - ${name}`,
    description: `Want to work with me? Here's a breakdown of what I can do for you.`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Let's work together!`,
    ),
    url: `${website}/lets-work-together`,
    slug: 'lets-work-together',
  })
</script>

<svelte:window on:scroll={handle_scroll} />

<Head {seo_config} />

{#if headings_promise}
  {#await headings_promise}
    <p>Loading table of contents...</p>
  {:then headings}
    {#if show_table_of_contents && headings.length > 0}
      <TableOfContents {headings} />
    {:else if headings.length === 0}
      <p>No headings found</p>
    {/if}
  {:catch error}
    <p>Error loading table of contents: {error.message}</p>
  {/await}
{/if}

<div class="all-prose mb-10">
  <Copy />
</div>

<div class="mb-5 mt-10 flex w-full flex-col" bind:this={end_of_copy}>
  <div class="divider divider-secondary"></div>
</div>
