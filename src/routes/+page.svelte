<script lang="ts">
  import { Head } from 'svead'

  import { LandingHero, PeopleToMeet } from '$lib/components'
  import { website } from '$lib/info'
  import { default_seo_config } from '$lib/seo'

  import type { SeoConfig } from 'svead'

  const seo_config: SeoConfig = {
    ...default_seo_config,
    title: 'Hello World! Welcome to my site! Enjoy!',
    website: website,
  }

  export let data
  let { Copy } = data
</script>

<Head {seo_config} />

<LandingHero />

<article class="all-prose mb-10">
  <Copy />
</article>

<PeopleToMeet />

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
