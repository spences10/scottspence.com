<script>
	import { exchange_rates_store } from './stores'
	/** @type {{selected_currency?: string}} */
	let { selected_currency = $bindable('EUR') } = $props()
</script>

<legend class="sr-only">Currency Selection</legend>
<label for="selected_currency" class="label">
	<span class="text-base font-medium">Currency:</span>
</label>
<select
	id="selected_currency"
	bind:value={selected_currency}
	class="select select-sm rounded-box w-full text-sm"
>
	<option class="text-base-content" value="EUR">EUR</option>
	{#each Object.keys($exchange_rates_store || {}) as currency}
		<option class="text-base-content" value={currency}>
			{currency}
		</option>
	{/each}
</select>
