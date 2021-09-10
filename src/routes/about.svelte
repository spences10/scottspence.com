<script context="module">
  export const load = async () => {
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
  import DateUpdated from '$lib/components/date-updated.svelte'
  import Head from '$lib/components/head.svelte'
  import Small from '$lib/components/small.svelte'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let Copy
</script>

<Head
  title={`About · ${name}`}
  description={`Some info about ${name}`}
  image={ogImageUrl(name, `scottspence.com`, `About`)}
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
  <div class="divider" />
</div>
