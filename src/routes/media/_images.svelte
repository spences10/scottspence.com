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
    <img src={selectedImage.square} alt={selectedImage.alt} />
  </a>
  <div class="flex gap-2 justify-between mt-4">
    {#each images as image}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="gallery-item" on:click={() => handleClick(image)}>
        <img src={image.thumb} alt={image.alt} />
      </div>
    {/each}
  </div>
</div>
