<script lang="ts">
  import type { Snippet } from 'svelte'

  let { reply = false, children } = $props<{
    reply: boolean
    children: Snippet
  }>()
</script>

<div>
  <div class="flex {reply ? 'chat-start' : 'chat-end justify-end'}">
    <section
      class="chat-bubble mb-8 {reply
        ? 'chat-bubble-accent'
        : 'chat-bubble-primary'}"
    >
      {@render children?.()}
    </section>
  </div>
</div>
