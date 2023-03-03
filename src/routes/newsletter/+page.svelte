<script lang="ts">
  import { Head, NewsletterSignup } from '$lib/components'
  import { name, website } from '$lib/info'
  import { ogImageUrl } from '$lib/og-image-url-build'

  export let data
  let { Copy } = data
</script>

<Head
  title={`Newsletter, get updates on what I'm working on - ${name}`}
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
