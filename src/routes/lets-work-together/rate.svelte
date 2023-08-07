<script lang="ts">
  import {
    exchange_rates_store,
    get_field_value,
    locale_string,
  } from '.'
  import {
    calculate_cost_with_holidays,
    calculate_day_rate,
    calculate_day_rate_including_holidays,
    calculate_total_annual_rate,
    convert_currency,
  } from './pricing'

  let annual_rate_EUR = get_field_value('ANNUAL_RATE_EUR') || 0
  let chosen_holidays = get_field_value('CHOSEN_HOLIDAYS') || 0
  let selected_currency = 'EUR'

  $: day_rate = calculate_day_rate(annual_rate_EUR || 0)
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
  $: currency_rate =
    selected_currency === 'EUR'
      ? 1
      : $exchange_rates_store[selected_currency]
  $: day_rate_in_selected_currency = convert_currency(
    day_rate,
    currency_rate,
  )
  $: day_rate_including_holidays_in_selected_currency =
    convert_currency(day_rate_including_holidays, currency_rate)
  $: total_annual_rate_in_selected_currency = convert_currency(
    total_annual_rate,
    currency_rate,
  )

  const on_annual_rate_input = (e: Event) => {
    annual_rate_EUR = Math.max(
      (e.target as HTMLInputElement).valueAsNumber,
      get_field_value('ANNUAL_RATE_EUR') || 0,
    )
  }
</script>

<div class="flex flex-col">
  <label>
    Annual rate (EUR) {locale_string(annual_rate_EUR)}:
    <input
      type="range"
      min={60000}
      max={120000}
      step={5000}
      bind:value={annual_rate_EUR}
      on:input={on_annual_rate_input}
      class="range range-primary"
    />
  </label>
  <label>
    PTO (days):
    <input
      type="range"
      min={0}
      max={40}
      step={1}
      bind:value={chosen_holidays}
      class="range range-primary"
    />
    {chosen_holidays}
  </label>
  <label>
    Currency:
    <select
      bind:value={selected_currency}
      class="select select-bordered select-sm text-base"
    >
      <option value="EUR">EUR</option>
      {#each Object.keys($exchange_rates_store || {}) as currency}
        <option value={currency}>{currency}</option>
      {/each}
    </select>
  </label>
</div>

<div
  class="stats stats-vertical md:stats-horizontal shadow-lg border border-secondary w-full mt-10"
>
  <div class="stat">
    <div class="stat-title">Day rate</div>
    <div class="stat-value flex">
      {locale_string(
        day_rate_including_holidays_in_selected_currency,
      )}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Without PTO</div>
    <div class="stat-value flex">
      {locale_string(day_rate_in_selected_currency)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Annual with PTO</div>
    <div class="stat-value flex">
      {locale_string(total_annual_rate_in_selected_currency)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</div>
