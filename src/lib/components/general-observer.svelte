<script lang="ts">
  import { viewport } from '$lib/utils'

  interface Props {
    height?: number
    width?: number
    children?: import('svelte').Snippet
  }

  let { height = 100, width = 100, children }: Props = $props()

  let intersecting: boolean = $state()
</script>

<div
  use:viewport
  onenter_viewport={() => (intersecting = true)}
  onexit_viewport={() => (intersecting = false)}
>
  {#if intersecting}
    <div class="mb-12 flex justify-center" style={`width: ${width}`}>
      {@render children?.()}
    </div>
  {:else}
    <div
      class="mb-12 flex justify-center"
      style={`height:${height}px;width: 100%`}
    ></div>
  {/if}
</div>
