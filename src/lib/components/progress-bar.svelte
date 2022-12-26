<script>
  export let value = 0
  export let max = 100
  export let width = `w-full`
  export let label = ``
  let progress = ((value / max) * 100).toFixed()
</script>

<section class={`not-prose ${width} ${label ? `` : `-mt-4`}`}>
  {#if label}
     <label for="progress" class="label -mb-5 -ml-1">
       <span class="label-text text-lg font-medium">{label}</span>
     </label>
  {/if}
  <progress
    id="progress"
    class="progress progress-primary w-full"
    {value}
    {max}
  />
  <label for="progress" class="label -mt-4 -ml-1">
    <span class="label-text text-lg font-medium">{progress}%</span>
  </label>
</section>
