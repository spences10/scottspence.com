<script>
  export let value = 0
  export let max = 100
  export let width = ``
  export let label = ``
</script>

<label for="progress" class="label -mb-5">
  <span class="label-text">{label}</span>
</label>
<progress
  name="progress"
  class={`progress progress-primary ${width}`}
  {value}
  {max}
/>
