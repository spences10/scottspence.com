<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/newsletter.md`)
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
  import { description, name } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let Copy
</script>

<Head
  title={`Newsletter · ${name}`}
  {description}
  image={ogImageUrl(name, 'scottspence.com', name)}
/>

<svelte:component this={Copy} />

<iframe
  title="substack_subscribe"
  src="https://spences10.substack.com/embed"
  width="100%"
  height="320"
  style="border:1px solid #EEE; background:transparent;"
  frameborder="0"
  scrolling="no"
/>
