<script lang="ts">
  import { slide } from 'svelte/transition'
  export let buttonText = ''
  export let isOpen = false
  export let styles = ''
</script>

<div>
  <button
    class="btn {styles} shadow-xl"
    on:click={() => (isOpen = !isOpen)}
  >
    {isOpen ? `Close` : buttonText}
  </button>
  {#if isOpen}
    <div transition:slide|global>
      <slot />
    </div>
  {/if}
</div>
