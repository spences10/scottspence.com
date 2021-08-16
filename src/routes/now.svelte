<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/now.md`)
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
  title={`What I'm doing now · ${name}`}
  description={`What I'm doing now.`}
  image={ogImageUrl(name, `scottspence.com`, `What I'm doing now.`)}
  url={`${website}/now`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>
