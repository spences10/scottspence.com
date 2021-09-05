<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/about.md`)
      return {
        props: {
          Copy: Copy.default,
        },
      }
    } catch (e) {
      return {
        status: 404,
        error: 'Uh oh!',
      }
    }
  }
</script>

<script>
  import Head from '$lib/components/head.svelte'
  import LandingHero from '$lib/components/landing-hero.svelte'
  import PeopleToMeet from '$lib/components/people-to-meet.svelte'
  import { description, name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let Copy
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
