<script lang="ts">
  export let sarky = ''

  let transformedText = ''

  $: {
    transformedText = sarky
      .split('')
      .map((char, i) => char[`to${i % 2 ? 'Upper' : 'Lower'}Case`]())
      .join('')
  }
</script>

<span class="font-semibold">
  {transformedText}
</span>
