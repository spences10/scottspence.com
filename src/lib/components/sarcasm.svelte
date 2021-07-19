<script>
  export let children = ''
  let sarky = children
    .split('')
    .map((char, i) => char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]())
    .join('')
</script>

<span class="font-semibold">
  <slot />
</span>
