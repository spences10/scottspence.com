<script lang="ts">
  import { Head, LandingHero, PeopleToMeet } from '$lib/components'
  import { description, name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Hello World! Welcome to my site! Enjoy! - ${name}`}
  {description}
  image={og_image_url(name, `scottspence.com`, name)}
  url={website}
/>

<LandingHero />

<article class="all-prose mb-10">
  <svelte:component this={Copy} />
</article>

<PeopleToMeet />

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
