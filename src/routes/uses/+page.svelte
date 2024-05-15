<script lang="ts">
  import { Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Uses - ${name}`}
  description={`The equipment I use to do what I do.`}
  image={og_image_url(name, `scottspence.com`, `Uses`)}
  url={`${website}/uses`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
