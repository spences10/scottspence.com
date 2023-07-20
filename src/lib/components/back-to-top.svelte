<script lang="ts">
  import { fly } from 'svelte/transition'

  let show_scroll_button = false
  let last_scroll_top = 0

  function scroll_to_top() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handle_scroll() {
    const current_scroll_top = window.pageYOffset
    show_scroll_button =
      current_scroll_top > last_scroll_top && current_scroll_top > 0
    last_scroll_top = current_scroll_top
  }
</script>

<svelte:window on:scroll={handle_scroll} />

{#if show_scroll_button}
  <button
    on:click={scroll_to_top}
    transition:fly|global={{ y: 200, duration: 300 }}
    class="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 btn btn-secondary normal-case font-normal shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent rounded-box"
    aria-label="Back to top"
    data-testid="back-to-top"
  >
    Back to top
  </button>
{/if}
