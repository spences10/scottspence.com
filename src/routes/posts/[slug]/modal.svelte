<script lang="ts">
  let { modal, children } = $props<{
    modal: HTMLDialogElement
    children: any
  }>()
</script>

<dialog
  class="rounded-box backdrop:backdrop-blur-sm backdrop:backdrop-filter"
  bind:this={modal}
  on:close
>
  {@render children()}
</dialog>
