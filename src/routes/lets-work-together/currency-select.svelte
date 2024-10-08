<script>
  import { exchange_rates_store } from './stores'
  /** @type {{selected_currency?: string}} */
  let { selected_currency = $bindable('EUR') } = $props()
</script>

<legend class="sr-only">Currency Selection</legend>
<label for="selected_currency" class="label">
  <span class="label-text text-base">Currency:</span>
</label>
<select
  id="selected_currency"
  bind:value={selected_currency}
  class="select select-bordered select-sm mb-5 text-sm"
>
  <option value="EUR">EUR</option>
  {#each Object.keys($exchange_rates_store || {}) as currency}
    <option value={currency}>{currency}</option>
  {/each}
</select>
