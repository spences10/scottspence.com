<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/privacy-policy.md`)
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
  title={`Privacy Policy · ${name}`}
  description={`${name} Privacy Policy page.`}
  image={ogImageUrl(name, `scottspence.com`, `Privacy Policy`)}
  url={`${website}/privacy-policy`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>
