<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/uses.md`)
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
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let Copy
</script>

<Head
  title={`Uses · ${name}`}
  description={`The equipment I use to do what I do.`}
  image={ogImageUrl(name, `scottspence.com`, `Uses`)}
  url={`${website}/uses`}
/>

<svelte:component this={Copy} />
