<script context="module">
  export const load = async () => {
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
  import NewsletterSignup from '$lib/components/newsletter-signup.svelte'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let Copy
</script>

<Head
  title={`Newsletter, get updates on what I'm working on · ${name}`}
  description={`Keep up to date with what content I'm creating with my newsletter.`}
  image={ogImageUrl(name, `scottspence.com`, `Newsletter`)}
  url={`${website}/newsletter`}
/>

<div class="all-prose">
  <svelte:component this={Copy} />
</div>

<NewsletterSignup />

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
