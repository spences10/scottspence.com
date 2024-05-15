<script lang="ts">
  import { marked } from 'marked'
  export let markdownContent = ''
  export let rows = 3

  $: markdown = marked(markdownContent)
</script>

<div class="prose mb-10 xs:grid xs:grid-cols-2 xs:gap-10">
  <textarea
    {rows}
    bind:value={markdownContent}
    class="h-full w-full resize-none rounded-box border border-base-100 bg-base-200 p-2"
  ></textarea>

  <div class="w-full">{@html markdown}</div>
</div>
