<script lang="ts">
  import { DateUpdated, Small } from '$lib/components'
  import { name, website } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import { og_image_url } from '$lib/utils'
  import { Head } from 'svead'
  import Images from './images.svelte'

  export let data
  let { CorporateCopy, FunCopy } = data

  let show_fun_copy = true
  const toggle_copy = () => {
    show_fun_copy = !show_fun_copy
  }

  const seo_config = create_seo_config({
    title: `Media - ${name}`,
    description: `Media pack for ${name}`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Media Pack`,
    ),
    url: `${website}/media`,
    slug: 'media',
  })
</script>

<Head {seo_config} />

<div class="all-prose">
  <h1>Media Pack</h1>
  <Small>
    Last updated: <DateUpdated date="2023-03-10" small="true" />
  </Small>

  <div class="items-center sm:flex lg:-mx-40">
    <p class="sm:mb-36 sm:w-2/3 sm:px-5">
      Pick any of the images of me from here and use them on your
      website or social media. You can click on the selected main
      image to get the full resolution.
    </p>
    <Images />
  </div>

  <p>
    Bio information. If there's anything else you need let me know.
  </p>

  <div class="mb-10 flex items-center space-x-2">
    <input
      type="checkbox"
      id="toggle-copy"
      class="toggle"
      on:click={toggle_copy}
    />
    <label class="label inline-block" for="toggle-copy">
      {show_fun_copy ? `Fun` : `Corporate`}
    </label>
  </div>

  {#if show_fun_copy}
    <FunCopy />
  {:else}
    <CorporateCopy />
  {/if}
</div>

<div class="my-10 flex w-full flex-col">
  <div class="divider divider-secondary"></div>
</div>
