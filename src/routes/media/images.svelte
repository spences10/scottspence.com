<script lang="ts">
  import { images } from './images'
  let selectedImage = images[0]

  function handleClick(image: {
    url: string
    square: string
    thumb: string
    alt: string
  }) {
    selectedImage = image
  }
</script>

<div class="w-full sm:w-1/3">
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={selectedImage.url}
  >
    <img
      class="m-0 shadow-xl"
      src={selectedImage.square}
      alt={selectedImage.alt}
    />
  </a>
  <div class="flex gap-2 justify-between">
    {#each images as image}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => handleClick(image)}>
        <img
          class="cursor-pointer shadow-xl"
          src={image.thumb}
          alt={image.alt}
        />
      </div>
    {/each}
  </div>
</div>
