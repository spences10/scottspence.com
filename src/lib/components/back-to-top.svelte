<script lang="ts">
  import { fly } from 'svelte/transition'

  let show_scroll_button = false

  function scroll_to_top() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handle_scroll() {
    show_scroll_button = window.pageYOffset > 0
  }
</script>

<svelte:window on:scroll={handle_scroll} />

{#if show_scroll_button}
  <button
    on:click={scroll_to_top}
    transition:fly={{ y: 200, duration: 300 }}
    class="fixed bottom-8 right-8 btn btn-secondary normal-case shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent"
    aria-label="Back to top"
  >
    Back to top
  </button>
{/if}
