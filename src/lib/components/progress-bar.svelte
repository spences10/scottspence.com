<script>
  export let value = 0
  export let max = 100
  export let width = `w-full`
  export let label = ``
  let progress = ((value / max) * 100).toFixed()
</script>

<section class={`${width}`}>
  <label for="progress" class="label -mb-5 -ml-1">
    <span class="label-text">{label}</span>
  </label>
  <progress
    id="progress"
    class="progress progress-primary w-full"
    {value}
    {max}
  />
  <label for="progress" class="label -mt-4 -ml-1">
    <span class="label-text">{progress}%</span>
  </label>
</section>
