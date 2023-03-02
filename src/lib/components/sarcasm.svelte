<script lang="ts">
  let children: string | null

  const sarky = (node: HTMLSpanElement) => {
    children = node.childNodes[0]?.nodeValue

    if (children) {
      node.childNodes[0].nodeValue = children
        .split('')
        .map((char, i) =>
          char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]()
        )
        .join('')
    }
  }
</script>

<span class="font-semibold" use:sarky>
  <slot />
</span>
