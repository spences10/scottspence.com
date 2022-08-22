<script>
  import Head from '@components/head.svelte'
  import LandingHero from '@components/landing-hero.svelte'
  import PeopleToMeet from '@components/people-to-meet.svelte'
  import { description, name, website } from '@lib/info'
  import { ogImageUrl } from '@lib/og-image-url-build'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Hello World! Welcome to my site! Enjoy! · ${name}`}
  {description}
  image={ogImageUrl(name, `scottspence.com`, name)}
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
