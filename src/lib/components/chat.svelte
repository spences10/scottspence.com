<script lang="ts">
  export let reply = false
</script>

<div>
  <div class="flex {reply ? 'chat-start' : 'chat-end justify-end'}">
    <section
      class="chat-bubble mb-8 {reply
        ? 'chat-bubble-accent'
        : 'chat-bubble-primary'}"
    >
      <slot />
    </section>
  </div>
</div>
