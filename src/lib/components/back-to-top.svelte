<script>
  import { scrollToTop } from 'svelte-scrollto'
</script>

<div
  class="rounded-xl cursor-pointer flex mr-16 mb-5 p-6 right-0 bottom-0 z-20 justify-end fixed backdrop-filter backdrop-blur"
>
  <div on:click={() => scrollToTop()}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="m-auto h-8 mb-2 animate-bounce w-8 block"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 10l7-7m0 0l7 7m-7-7v18"
      />
    </svg>
    <p class="font-bold">Back To Top</p>
  </div>
</div>
