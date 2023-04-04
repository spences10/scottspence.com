<script lang="ts">
  export let sarky: string = ''

  let transformedText: string = ''

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
