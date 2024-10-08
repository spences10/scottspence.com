<script lang="ts">
  import { name, website } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import { og_image_url } from '$lib/utils'
  import { Head } from 'svead'

  interface Props {
    data: any
  }

  let { data }: Props = $props()
  let { Copy } = data

  const seo_config = create_seo_config({
    title: `Uses - ${name}`,
    description: `The equipment I use to do what I do.`,
    open_graph_image: og_image_url(name, `scottspence.com`, `Uses`),
    url: `${website}/uses`,
    slug: 'uses',
  })
</script>

<Head {seo_config} />

<div class="all-prose">
  <Copy />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
