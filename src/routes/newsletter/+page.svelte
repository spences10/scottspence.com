<script lang="ts">
  import { Head, NewsletterSignup } from '$lib/components'
  import { name, website } from '$lib/info'
  import { newsletter_subscriber_count_store } from '$lib/stores/index.js'
  import { og_image_url } from '$lib/utils'

  export let data
  let { Copy } = data

  $newsletter_subscriber_count_store =
    data?.newsletter_subscriber_count
</script>

<Head
  title={`Newsletter, get updates on what I'm working on - ${name}`}
  description={`Keep up to date with what content I'm creating with my newsletter.`}
  image={og_image_url(name, `scottspence.com`, `Newsletter`)}
  url={`${website}/newsletter`}
/>

<div class="all-prose">
  <Copy />
</div>

<NewsletterSignup />

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
