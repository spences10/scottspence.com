<script>
  import { slide } from 'svelte/transition'
  export let buttonText = ''
  export let open = false
</script>

<section class="border not-prose">
  <button
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
    <div transition:slide>
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
