<script>
  import { exchange_rates_store } from './stores'
  export let selected_currency = 'EUR'
</script>

<legend class="sr-only">Currency Selection</legend>
<label for="selected_currency" class="label">
  <span class="label-text text-base">Currency:</span>
</label>
<select
  id="selected_currency"
  bind:value={selected_currency}
  class="select select-bordered select-sm text-sm mb-5"
>
  <option value="EUR">EUR</option>
  {#each Object.keys($exchange_rates_store || {}) as currency}
    <option value={currency}>{currency}</option>
  {/each}
</select>
