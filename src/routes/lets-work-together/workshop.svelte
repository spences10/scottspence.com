<script lang="ts">
  import {
    ANNUAL_RATE_EUR,
    CHOSEN_HOLIDAYS,
    WORKING_DAYS,
    calculate_total_annual_rate,
    calculate_price_per_attendee,
    convert_currency,
  } from './pricing'

  // Calculate the day rate based on the annual rate
  let day_rate_EUR =
    calculate_total_annual_rate(ANNUAL_RATE_EUR, CHOSEN_HOLIDAYS) /
    WORKING_DAYS

  let workshop_duration = '90 minutes'
  const BESPOKE_PERCENTAGES: Record<string, number> = {
    '90 minutes': 1.2,
    'Half day': 1.5,
    'Full day': 1.8,
    'Two days': 2,
    'Three days': 2.5,
  }

  let attendees = 3; // Minimum number of attendees

  $: workshop_cost_EUR =
    day_rate_EUR * BESPOKE_PERCENTAGES[workshop_duration]
  let selected_currency = 'EUR'
  $: workshop_cost = convert_currency(
    workshop_cost_EUR,
    selected_currency,
  )
  $: price_per_attendee = calculate_price_per_attendee(workshop_cost, attendees)
</script>

<label for="workshop_duration">Workshop Duration:</label>
<select id="workshop_duration" bind:value={workshop_duration}>
  {#each Object.keys(BESPOKE_PERCENTAGES) as duration}
    <option>{duration}</option>
  {/each}
</select>

<label for="attendees">Number of Attendees:</label>
<input id="attendees" type="range" min="3" max="20" bind:value={attendees} />

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

<p>
  Price per Attendee: {price_per_attendee.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}
  {selected_currency}
</p>
