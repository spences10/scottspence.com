<script>
  import { Head, TableOfContents } from '$lib/components'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'
  import { onMount } from 'svelte'

  export let data
  let { Copy } = data

  let headingNodeList
  let headings
  const getHeadings = async () => {
    await headings
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
  title={`Recruiter FAQs · ${name}`}
  description={`Frequently Asked Questions for recruiters.`}
  image={ogImageUrl(name, `scottspence.com`, `FAQs`)}
  url={`${website}/faq`}
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
