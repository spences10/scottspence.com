<script lang="ts">
  export let reply = false
  let styleReply = reply ? '' : 'flex justify-end'
  let styleContent = reply
    ? 'bg-accent text-accent-content rounded-bl-none'
    : 'bg-primary text-primary-content rounded-br-none'
</script>

<div>
  <div class={styleReply}>
    <section
      class={`p-3 mb-5 w-3/4 rounded-3xl ${styleContent} last:prose-p:m-0 first:prose-p:m-0`}
    >
      <slot />
    </section>
  </div>
</div>
