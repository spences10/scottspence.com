<script lang="ts">
  export let modal: HTMLDialogElement
</script>

<dialog class="rounded-box backdrop:backdrop-filter backdrop:backdrop-blur-sm" bind:this={modal} on:close>
  <slot />
</dialog>
