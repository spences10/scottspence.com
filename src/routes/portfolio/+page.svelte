<script lang="ts">
  import { name, website } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import { og_image_url } from '$lib/utils'
  import { Head } from 'svead'

  export let data
  let { Copy } = data

  const seo_config = create_seo_config({
    title: `Portfolio Page, recent projects, GitHub contributions and more - ${name}`,
    description: `${name}'s Portfolio Page. Recent projects, GitHub contributions and more`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Scott Spence Portfolio`,
    ),
    url: `${website}/portfolio`,
    slug: 'portfolio',
  })
</script>

<Head {seo_config} />

<div class="all-prose">
  <Copy />
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
