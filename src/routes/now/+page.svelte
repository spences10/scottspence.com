<script lang="ts">
  import { Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data
</script>

<Head
  title={`What I'm doing now - ${name}`}
  description={`What I'm doing now. Updated irregularly, check last updated date.`}
  image={og_image_url(name, `scottspence.com`, `What I'm doing now.`)}
  url={`${website}/now`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
