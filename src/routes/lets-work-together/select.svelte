<script lang="ts">
  export let id: string
  export let label: string
  export let selected: string
  export let options: string[]
</script>

<fieldset>
  <legend class="sr-only">{label}</legend>
  <label for={id} class="label">
    <span class="label-text text-base">{label}</span>
  </label>
  <select
    {id}
    bind:value={selected}
    class="select select-bordered select-sm text-sm mb-5"
  >
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
</fieldset>
