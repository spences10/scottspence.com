<script lang="ts">
  import { DateUpdated, Head, Small } from '$lib/components'
  import { name, website } from '$lib/info'
  import { og_image_url } from '$lib/utils'
  import Images from './_images.svelte'

  export let data
  let { CorporateCopy, FunCopy } = data

  let show_fun_copy = true
  const toggle_copy = () => {
    show_fun_copy = !show_fun_copy
  }
</script>

<Head
  title={`About - ${name}`}
  description={`Some info about ${name}`}
  image={og_image_url(name, `scottspence.com`, `About`)}
  url={`${website}/about`}
/>

<Images />

<div class="all-prose">
  <h1>Media Pack</h1>
  <Small>
    Last updated: <DateUpdated date="2023-03-10" small="true" />
  </Small>

  <p>Bio information and assets.</p>

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
