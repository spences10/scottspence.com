<script context="module">
  export async function load({ page }) {
    try {
      const Copy = await import(`../../copy/faq.md`)
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
  title={`Recruiter FAQs · ${name}`}
  description={`Frequently Asked Questions for recruiters.`}
  image={ogImageUrl(name, `scottspence.com`, `FAQs`)}
  url={`${website}/faq`}
/>

<svelte:component this={Copy} />
