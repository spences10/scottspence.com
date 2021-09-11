<script>
  import viewport from '$lib/use-viewport-action'

  export let height = 100
  export let width = 100

  let intersecting
</script>

<div
  use:viewport
  on:enterViewport={() => (intersecting = true)}
  on:exitViewport={() => (intersecting = false)}
>
  {#if intersecting}
    <div class="flex justify-center mb-12" style={`width: ${width}`}><slot /></div>
  {:else}
    <div
      class="flex justify-center mb-12"
      style={`height:${height}px;width: 100%`}
    />
  {/if}
</div>
