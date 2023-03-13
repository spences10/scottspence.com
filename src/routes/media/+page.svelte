<script lang="ts">
  import { DateUpdated, Head, Small } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'
  import Images from './images.svelte'

  export let data
  let { CorporateCopy, FunCopy } = data

  let show_fun_copy = true
  const toggle_copy = () => {
    show_fun_copy = !show_fun_copy
  }
</script>

<Head
  title={`Media - ${name}`}
  description={`Media pack for ${name}`}
  image={og_image_url(name, `scottspence.com`, `Media Pack`)}
  url={`${website}/media`}
/>

<div class="all-prose">
  <h1>Media Pack</h1>
  <Small>
    Last updated: <DateUpdated date="2023-03-10" small="true" />
  </Small>

  <div class="sm:flex lg:-mx-40 items-center">
    <p class="sm:w-2/3 sm:px-5 sm:mb-36">
      Pick any of the images of me from here and use them on your
      website or social media. You can click on the selected main
      image to get the full resolution.
    </p>
    <Images />
  </div>

  <p>
    Bio information. If there's anything else you need let me know.
  </p>

  <div class="flex items-center space-x-2">
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
    <svelte:component this={FunCopy} />
  {:else}
    <svelte:component this={CorporateCopy} />
  {/if}
</div>

<div class="flex flex-col w-full my-10">
  <div class="divider" />
</div>
