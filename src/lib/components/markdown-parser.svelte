<script>
  import marked from 'marked'
  export let markdownContent = ''
  $: markdown = marked(markdownContent)
</script>

<div class="grid grid-cols-2 gap-10 mb-10">
  <textarea
    bind:value={markdownContent}
    class="prose bg-base-200 border border-base-100"
  />

  <div class="prose">{@html markdown}</div>
</div>
