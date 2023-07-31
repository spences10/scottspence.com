<script lang="ts">
  import {
    calculate_total_annual_rate,
    convert_currency,
  } from './pricing'
  const ANNUAL_RATE_EUR = 50000 // Your annual rate, can be imported from pricing.ts
  const DAYS_PER_YEAR = 220 // Your working days in a year
  let chosen_holidays = 20 // Your chosen holidays, can be imported or user-defined

  // Calculate the day rate based on the annual rate
  let day_rate_EUR =
    calculate_total_annual_rate(ANNUAL_RATE_EUR, chosen_holidays) /
    DAYS_PER_YEAR

  let workshop_duration = '90 minutes' 
  const BESPOKE_PERCENTAGES: Record<string, number> = {
    '90 minutes': 1.2,
    'Half day': 1.5,
    'Full day': 1.8,
    'Two days': 2,
    'Three days': 2.5,
  }

  $: workshop_cost_EUR =
    day_rate_EUR * BESPOKE_PERCENTAGES[workshop_duration]
  let selected_currency = 'EUR'
  $: workshop_cost = convert_currency(
    workshop_cost_EUR,
    selected_currency,
  )
</script>

<label for="workshop_duration">Workshop Duration:</label>
<select id="workshop_duration" bind:value={workshop_duration}>
  {#each Object.keys(BESPOKE_PERCENTAGES) as duration}
    <option>{duration}</option>
  {/each}
</select>

<label for="selected_currency">Currency:</label>
<select id="selected_currency" bind:value={selected_currency}>
  <option value="EUR">EUR</option>
  <option value="USD">USD</option>
  <!-- Add other currencies if necessary -->
</select>

<p>
  Workshop Cost: {workshop_cost.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}
  {selected_currency}
</p>
