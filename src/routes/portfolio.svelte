<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/portfolio.md`)
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
  title={`Portfolio Page, recent projects, GitHub contributions and more · ${name}`}
  description={`${name}'s Portfolio Page. Recent projects, GitHub contributions and more`}
  image={ogImageUrl(
    name,
    `scottspence.com`,
    `Scott Spence Portfolio`
  )}
  url={`${website}/portfolio`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>
