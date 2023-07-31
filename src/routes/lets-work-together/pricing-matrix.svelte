<script lang="ts">
  import {
    ANNUAL_RATE_EUR,
    CHOSEN_HOLIDAYS,
    calculate_cost_with_holidays,
    calculate_day_rate,
    calculate_day_rate_including_holidays,
    calculate_total_annual_rate,
    convert_currency,
  } from './pricing'

  let annual_rate_EUR = ANNUAL_RATE_EUR
  let chosen_holidays = CHOSEN_HOLIDAYS
  let selected_currency = 'EUR'

  $: day_rate = calculate_day_rate(annual_rate_EUR)
  $: cost_with_holidays = calculate_cost_with_holidays(
    day_rate,
    chosen_holidays,
  )
  $: total_annual_rate = calculate_total_annual_rate(
    annual_rate_EUR,
    cost_with_holidays,
  )
  $: day_rate_including_holidays =
    calculate_day_rate_including_holidays(total_annual_rate)
  $: day_rate_in_selected_currency = convert_currency(
    day_rate,
    selected_currency,
  )
  $: day_rate_including_holidays_in_selected_currency =
    convert_currency(day_rate_including_holidays, selected_currency)
  $: total_annual_rate_in_selected_currency = convert_currency(
    total_annual_rate,
    selected_currency,
  )
</script>

<div class="flex flex-col">
  <label>
    Annual rate (EUR):
    <input
      type="range"
      min={ANNUAL_RATE_EUR}
      max={100000}
      step={5000}
      bind:value={annual_rate_EUR}
    />
    {annual_rate_EUR}
  </label>
  <label>
    Don't want to include holidays? (days):
    <input
      type="range"
      min={0}
      max={40}
      step={1}
      bind:value={chosen_holidays}
    />
    {chosen_holidays}
  </label>
  <label>
    Currency:
    <select bind:value={selected_currency} class="select">
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
    </select>
  </label>
</div>

<div
  class="stats stats-vertical md:stats-horizontal shadow-lg border border-secondary w-full"
>
  <div class="stat">
    <div class="stat-title">Day rate</div>
    <div class="stat-value flex">
      {day_rate_including_holidays_in_selected_currency.toLocaleString(
        undefined,
        {
          maximumFractionDigits: 0,
        },
      )}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Without PTO</div>
    <div class="stat-value flex">
      {day_rate_in_selected_currency.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Annual with PTO</div>
    <div class="stat-value flex">
      {total_annual_rate_in_selected_currency.toLocaleString(
        undefined,
        {
          maximumFractionDigits: 0,
        },
      )}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</div>
