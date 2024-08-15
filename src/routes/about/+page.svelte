<script lang="ts">
  import { Head } from '$lib/components'
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

  <Copy />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
