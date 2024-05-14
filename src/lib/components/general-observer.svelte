<script lang="ts">
  import { viewport } from '$lib/utils'

  export let height = 100
  export let width = 100

  let intersecting: boolean
</script>

<div
  use:viewport
  onenter_viewport={() => (intersecting = true)}
  onexit_viewport={() => (intersecting = false)}
>
  {#if intersecting}
    <div class="mb-12 flex justify-center" style={`width: ${width}`}>
      <slot />
    </div>
  {:else}
    <div
      class="mb-12 flex justify-center"
      style={`height:${height}px;width: 100%`}
    ></div>
  {/if}
</div>
