<script lang="ts">
  export let date
  export let small = ''
  import { format } from 'date-fns'
  const lastBuildDate = new Date()
  const buildDate = date
    ? format(new Date(date), 'MMMM do yyyy')
    : format(new Date(lastBuildDate), 'MMMM do yyyy')
</script>

<small>
  {#if small}
    <span class="text-xs">{buildDate}</span>
    <slot />
  {:else}
    <span class="text-base">{buildDate}</span>
  {/if}
</small>
