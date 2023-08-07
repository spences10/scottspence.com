<script lang="ts">
  import { exchange_rates_store, get_field_value } from './stores'
  import {
    calculate_day_rate,
    convert_currency,
    locale_string,
  } from './utils'

  let annual_rate_EUR = get_field_value('ANNUAL_RATE_EUR') || 0
  let working_days_in_year =
    get_field_value('WORKING_DAYS_IN_YEAR') || 0

  // workshop constants
  export const BASE_COST_5_OR_LESS =
    calculate_day_rate(annual_rate_EUR, working_days_in_year) * 2
  export const ADDITIONAL_COST_6_TO_10 =
    calculate_day_rate(annual_rate_EUR, working_days_in_year) * 0.5
  export const ADDITIONAL_COST_11_TO_15 =
    ADDITIONAL_COST_6_TO_10 * 0.9
  export const ADDITIONAL_COST_16_TO_20 =
    ADDITIONAL_COST_11_TO_15 * 0.9

  // Calculate workshop cost based on attendees
  export const calculate_workshop_cost = (attendees: number) => {
    if (attendees <= 5) {
      return BASE_COST_5_OR_LESS
    } else if (attendees <= 10) {
      return (
        BASE_COST_5_OR_LESS +
        (attendees - 5) * ADDITIONAL_COST_6_TO_10
      )
    } else if (attendees <= 15) {
      return (
        BASE_COST_5_OR_LESS +
        5 * ADDITIONAL_COST_6_TO_10 +
        (attendees - 10) * ADDITIONAL_COST_11_TO_15
      )
    } else {
      return (
        BASE_COST_5_OR_LESS +
        5 * ADDITIONAL_COST_6_TO_10 +
        5 * ADDITIONAL_COST_11_TO_15 +
        (attendees - 15) * ADDITIONAL_COST_16_TO_20
      )
    }
  }

  // Function to calculate price per attendee
  export const calculate_price_per_attendee = (
    workshop_cost: number,
    attendees: number,
  ) => workshop_cost / attendees

  // Function to calculate cost with customization
  export const calculate_cost_with_customization = (
    base_cost: number,
    customization_percentage: number,
  ) => base_cost * (1 + customization_percentage)

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

  $: currency_rate =
    selected_currency === 'EUR'
      ? 1
      : $exchange_rates_store[selected_currency]

  $: workshop_cost = convert_currency(
    workshop_cost_EUR,
    currency_rate,
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
  class="select select-bordered select-sm text-base"
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
  bind:value={selected_currency}
  class="select select-bordered select-sm text-base"
>
  <option value="EUR">EUR</option>
  {#each Object.keys($exchange_rates_store || {}) as currency}
    <option value={currency}>{currency}</option>
  {/each}
</select>

<p>
  Workshop Cost: {locale_string(workshop_cost)}
  {selected_currency}
</p>

<p>
  Price per Attendee: {locale_string(price_per_attendee)}
  {selected_currency}
</p>

<div
  class="stats stats-vertical md:stats-horizontal shadow-lg border border-secondary w-full mt-10"
>
  <div class="stat">
    <div class="stat-title">Attendees</div>
    <div class="stat-value flex">
      {attendees}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Price Per Attendee</div>
    <div class="stat-value flex">
      {locale_string(price_per_attendee)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Workshop Cost</div>
    <div class="stat-value flex">
      {locale_string(workshop_cost)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</div>
