<script>
  import { Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Portfolio Page, recent projects, GitHub contributions and more · ${name}`}
  description={`${name}'s Portfolio Page. Recent projects, GitHub contributions and more`}
  image={ogImageUrl(
    name,
    `scottspence.com`,
    `Scott Spence Portfolio`
  )}
  url={`${website}/portfolio`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
