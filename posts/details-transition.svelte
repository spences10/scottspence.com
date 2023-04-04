<script lang="ts">
  import { slide } from 'svelte/transition'
  export let buttonText = ''
  export let open = false
</script>

<section class="border not-prose">
  <button
    aria-controls="accordion__content_1"
    aria-expanded={open}
    tabindex="0"
    id="accordion__title_1"
    on:click={() => {
      open = !open
    }}
  >
    <div class="flex items-center text-left">
      <span style="margin:0 1rem;" class="transition" class:open>
        ▶
      </span>
      <p style="margin:1rem 0;">{buttonText}</p>
    </div>
  </button>
  {#if open}
    <div
      transition:slide
      id="accordion__content_1"
      role="region"
      aria-hidden={!open}
      aria-labelledby="accordion__title_1"
    >
      <slot />
    </div>
  {/if}
</section>

<style>
  .open {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>
