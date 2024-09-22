<script lang="ts">
  import { NewsletterSignup } from '$lib/components'
  import { name, website } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import { newsletter_subscriber_count_store } from '$lib/stores/index.js'
  import { og_image_url } from '$lib/utils'
  import { Head } from 'svead'

  export let data
  let { Copy } = data

  $newsletter_subscriber_count_store =
    data?.newsletter_subscriber_count

  const seo_config = create_seo_config({
    title: `Newsletter, get updates on what I'm working on - ${name}`,
    description: `Keep up to date with what content I'm creating with my newsletter.`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Newsletter`,
    ),
    url: `${website}/newsletter`,
    slug: 'newsletter',
  })
</script>

<Head {seo_config} />

<div class="all-prose">
  <Copy />
</div>

<NewsletterSignup />

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
