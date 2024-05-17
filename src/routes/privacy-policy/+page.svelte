<script lang="ts">
  import { Head } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Privacy Policy - ${name}`}
  description={`${name} Privacy Policy page.`}
  image={og_image_url(name, `scottspence.com`, `Privacy Policy`)}
  url={`${website}/privacy-policy`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
