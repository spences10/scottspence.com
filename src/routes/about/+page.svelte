<script lang="ts">
  import { DateUpdated, Head, Small } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data
</script>

<Head
  title={`About - ${name}`}
  description={`Some info about ${name}`}
  image={og_image_url(name, `scottspence.com`, `About`)}
  url={`${website}/about`}
/>

<div class="all-prose">
  <h1>About</h1>
  <Small>
    Last updated: <DateUpdated date="2021-08-14" small="true" />
  </Small>
  <svelte:component this={Copy} />
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider divider-secondary" />
</div>
