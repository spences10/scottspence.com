<script lang="ts">
  import { exchange_rates_store, get_field_value } from './stores'
  import {
    calculate_day_rate_with_pto,
    calculate_day_rate_without_pto,
    convert_currency,
    locale_string,
  } from './utils'

  let annual_rate_EUR = get_field_value('ANNUAL_RATE_EUR') || 0
  let chosen_holidays = get_field_value('CHOSEN_HOLIDAYS') || 0
  let working_days_in_year =
    get_field_value('WORKING_DAYS_IN_YEAR') || 0
  let public_holidays = get_field_value('PUBLIC_HOLIDAYS') || 0
  let selected_currency = 'EUR'

  $: day_rate_with_pto = calculate_day_rate_with_pto(
    annual_rate_EUR || 0,
    working_days_in_year,
    chosen_holidays,
    public_holidays,
  )

  $: day_rate_without_pto = calculate_day_rate_without_pto(
    annual_rate_EUR || 0,
    working_days_in_year,
  )

  $: currency_rate =
    selected_currency === 'EUR'
      ? 1
      : $exchange_rates_store[selected_currency]

  $: day_rate_with_pto_in_selected_currency = convert_currency(
    day_rate_with_pto,
    currency_rate,
  )

  $: day_rate_without_pto_in_selected_currency = convert_currency(
    day_rate_without_pto,
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
      {locale_string(day_rate_with_pto_in_selected_currency)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Without PTO</div>
    <div class="stat-value flex">
      {locale_string(day_rate_without_pto_in_selected_currency)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Annual with PTO</div>
    <div class="stat-value flex">
      {locale_string(annual_rate_EUR * currency_rate)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</div>
