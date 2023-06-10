<script lang="ts">
  import { marked } from 'marked'
  export let markdownContent = ''
  export let rows = 3

  $: markdown = marked(markdownContent, {
    mangle: false,
    headerIds: false,
  })
</script>

<div class="mb-10 prose xs:grid xs:gap-10 xs:grid-cols-2">
  <textarea
    {rows}
    bind:value={markdownContent}
    class="border rounded-box h-full bg-base-200 border-base-100 w-full p-2 resize-none"
  />

  <div class="w-full">{@html markdown}</div>
</div>
