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

  interface Props {
    data: any
  }

  let { data }: Props = $props()
  let { Copy } = data

  let end_of_copy: HTMLElement | null = $state()
  let show_table_of_contents = $state(true)
  let headings_promise: Promise<{ label: string; href: string }[]> =
    $state()

  onMount(() => {
    headings_promise = get_headings()
  })

  const handle_scroll = () => {
    show_table_of_contents = update_toc_visibility(end_of_copy)
  }

  const seo_config = create_seo_config({
    title: `Speaking - ${name}`,
    description: `A list of events where ${name} has held a workshop, a talk or spoken publicly.`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Scott Speaks!`,
    ),
    url: `${website}/speaking`,
    slug: 'speaking',
  })
</script>

<svelte:window onscroll={handle_scroll} />

<Head {seo_config} />

{#if headings_promise}
  {#await headings_promise}
    <p>Loading table of contents...</p>
  {:then headings}
    {#if show_table_of_contents && headings.length > 0}
      <TableOfContents {headings} />
    {/if}
  {:catch error}
    <p>Error loading table of contents: {error.message}</p>
  {/await}
{/if}

<div class="all-prose">
  <Copy />
</div>

<div class="mb-5 mt-10 flex w-full flex-col" bind:this={end_of_copy}>
  <div class="divider divider-secondary"></div>
</div>
