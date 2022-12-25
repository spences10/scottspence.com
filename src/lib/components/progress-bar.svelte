<script>
  export let value = 0
  export let max = 100
  export let width = ``
  export let label = ``
  let progress = (value / max * 100).toFixed()
</script>

<label for="progress" class="label -mb-5 -ml-1">
  <span class="label-text">{label}</span>
</label>
<progress
name="progress"
class={`progress progress-primary ${width}`}
{value}
{max}
/>
<label for="progress" class="label -mt-4 -ml-1">
  <span class="label-text">{progress}%</span>
</label>
