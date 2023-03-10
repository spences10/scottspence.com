<script lang="ts">
  import { images } from './_images'
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

<div class="w-full">
  <a
    target="_blank"
    rel="noopener noreferrer"
    href={selectedImage.url}
  >
    <img class="m-0" src={selectedImage.square} alt={selectedImage.alt} />
  </a>
  <div class="flex gap-2 justify-between">
    {#each images as image}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div on:click={() => handleClick(image)}>
        <img
          class="cursor-pointer"
          src={image.thumb}
          alt={image.alt}
        />
      </div>
    {/each}
  </div>
</div>
