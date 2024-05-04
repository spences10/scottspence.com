<script lang="ts">
  let show_scroll_button = $state(false)
  let last_scroll_top = $state(0)

  const scroll_to_top = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handle_scroll = () => {
    const current_scroll_top = window.scrollY
    show_scroll_button =
      current_scroll_top > last_scroll_top && current_scroll_top > 0
    last_scroll_top = current_scroll_top
  }
</script>

<svelte:window on:scroll={handle_scroll} />

<button
  onclick={scroll_to_top}
  class="back-to-top-button btn btn-secondary z-10 rounded-box font-normal normal-case shadow-2xl focus:outline-none focus:ring-2 focus:ring-accent {show_scroll_button
    ? 'show-button'
    : 'hide-button'}"
  aria-label="Back to top"
  data-testid="back-to-top"
>
  Back to top
</button>

<style>
  @keyframes flyIn {
    0% {
      transform: translateY(100px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes flyOut {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(100px);
      opacity: 0;
    }
  }

  .back-to-top-button {
    position: fixed;
    right: 2rem;
    bottom: -2rem;
    transition: bottom 0.3s ease-in-out;
  }

  .show-button {
    bottom: 5rem;
    animation: flyIn 0.3s ease forwards;
  }

  @media (min-width: 1024px) {
    /* Tailwind's 'lg' breakpoint */
    .show-button {
      bottom: 2rem;
    }
  }

  .hide-button {
    animation: flyOut 0.3s ease forwards;
  }
</style>
