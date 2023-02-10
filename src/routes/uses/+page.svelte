<script>
  import { Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Uses - ${name}`}
  description={`The equipment I use to do what I do.`}
  image={ogImageUrl(name, `scottspence.com`, `Uses`)}
  url={`${website}/uses`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
