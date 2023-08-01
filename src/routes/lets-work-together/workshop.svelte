<script lang="ts">
  import {
    calculate_price_per_attendee,
    calculate_workshop_cost,
    convert_currency,
  } from './pricing'

  let workshop_duration = '90 minutes'
  const BESPOKE_PERCENTAGES: Record<string, number> = {
    '90 minutes': 1.2,
    'Half day': 1.8,
    'Full day': 3.5,
    'Two days': 6.5,
    'Three days': 9,
  }

  let attendees = 5 // Minimum number of attendees

  let selected_currency = 'EUR'
  $: workshop_cost_EUR =
    calculate_workshop_cost(attendees) *
    BESPOKE_PERCENTAGES[workshop_duration]
  $: workshop_cost = convert_currency(
    workshop_cost_EUR,
    selected_currency,
  )
  $: price_per_attendee = calculate_price_per_attendee(
    workshop_cost,
    attendees,
  )

  const on_attendees_input = (e: Event) => {
    attendees = Math.max(
      (e.target as HTMLInputElement).valueAsNumber,
      5,
    )
  }
</script>

<label for="workshop_duration" class="label">
  <span class="label-text">Workshop Duration:</span>
</label>
<select
  id="workshop_duration"
  bind:value={workshop_duration}
  class="select select-bordered"
>
  {#each Object.keys(BESPOKE_PERCENTAGES) as duration}
    <option>{duration}</option>
  {/each}
</select>

<label for="attendees" class="label">
  <span class="label-text">Number of Attendees:</span>
</label>
<input
  id="attendees"
  type="range"
  min="1"
  max="20"
  bind:value={attendees}
  class="range range-primary"
  on:input={on_attendees_input}
/>
{attendees}

<label for="selected_currency" class="label">
  <span class="label-text">Currency:</span>
</label>
<select
  id="selected_currency"
  bind:value={selected_currency}
  class="select select-bordered"
>
  <option value="EUR">EUR</option>
  <option value="USD">USD</option>
  <!-- Add other currencies if necessary -->
</select>

<p>
  Workshop Cost: {workshop_cost.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}
  {selected_currency}
</p>

<p>
  Price per Attendee: {price_per_attendee.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}
  {selected_currency}
</p>
