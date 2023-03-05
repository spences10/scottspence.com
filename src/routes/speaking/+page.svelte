<script lang="ts">
  import { Head, TableOfContents } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'
  import { onMount } from 'svelte'

  export let data
  let { Copy } = data

  let headingNodeList
  let headings: { label: string; href: string }[] = []
  const getHeadings = async () => {
    headings
  }

  onMount(() => {
    headingNodeList = document.querySelectorAll('h2')
    headings = Array.from(headingNodeList).map(h2 => {
      return {
        label: h2.innerText,
        href: `#${h2.id}`,
      }
    })
  })
</script>

<Head
  title={`Speaking - ${name}`}
  description={`A list of events where ${name} has held a workshop, a talk or spoken publicly.`}
  image={og_image_url(name, `scottspence.com`, `Scott Speaks!`)}
  url={`${website}/speaking`}
/>

{#await getHeadings()}
  Loading...
{:then}
  <TableOfContents {headings} />
{/await}

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
