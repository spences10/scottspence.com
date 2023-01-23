<script>
  let children = ''

  const sarky = node => {
    children = node.childNodes[0].nodeValue

    node.childNodes[0].nodeValue = children
      .split('')
      .map((char, i) => char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]())
      .join('')
  }
</script>

<span class="font-semibold" use:sarky>
  <slot />
</span>
