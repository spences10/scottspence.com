<script lang="ts">
  import { name, website } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import { og_image_url } from '$lib/utils'
  import { Head } from 'svead'

  export let data
  let { Copy } = data

  const seo_config = create_seo_config({
    title: `Privacy Policy - ${name}`,
    description: `${name} Privacy Policy page.`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Privacy Policy`,
    ),
    url: `${website}/privacy-policy`,
    slug: 'privacy-policy',
  })
</script>

<Head {seo_config} />

<div class="all-prose">
  <Copy />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
