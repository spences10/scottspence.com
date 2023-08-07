<script lang="ts">
  import { exchange_rates_store, get_field_value } from './stores'
  import {
    calculate_day_rate_without_pto,
    convert_currency,
    locale_string,
  } from './utils'

  let annual_rate_EUR = get_field_value('ANNUAL_RATE_EUR') || 0
  let working_days_in_year =
    get_field_value('WORKING_DAYS_IN_YEAR') || 0

  export const calculate_cost_with_customization = (
    base_cost: number,
    customization_percentage: number,
  ) => base_cost * (1 + customization_percentage)

  export const VIDEO_DURATION = {
    Short: {
      description: '5-10 min',
      cost:
        calculate_day_rate_without_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 1.5,
    },
    Medium: {
      description: '10-20 min',
      cost:
        calculate_day_rate_without_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 2.5,
    },
    Long: {
      description: '20-30 min',
      cost:
        calculate_day_rate_without_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 3.6,
    },
    'Extra Long': {
      description: '>30 min',
      cost:
        calculate_day_rate_without_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 4.8,
    },
  }

  export const VIDEO_CUSTOMIZATION_PERCENTAGES = {
    None: 0,
    Minor: 0.3, // 30% extra
    Moderate: 0.5, // 50% extra
    Major: 1.1, // 110% extra
  }

  const VIDEO_DURATION_OPTIONS = Object.keys(VIDEO_DURATION)
  const CUSTOMIZATION_LEVEL_OPTIONS = Object.keys(
    VIDEO_CUSTOMIZATION_PERCENTAGES,
  )

  let selected_video_duration = VIDEO_DURATION_OPTIONS[0]
  let selected_customization_level = CUSTOMIZATION_LEVEL_OPTIONS[0]
  let selected_currency = 'EUR'
  let selected_duration: string

  $: selected_duration =
    VIDEO_DURATION[
      selected_video_duration as keyof typeof VIDEO_DURATION
    ].description
  $: video_cost =
    VIDEO_DURATION[
      selected_video_duration as keyof typeof VIDEO_DURATION
    ].cost
  $: video_cost_with_customization =
    calculate_cost_with_customization(
      video_cost,
      VIDEO_CUSTOMIZATION_PERCENTAGES[
        selected_customization_level as keyof typeof VIDEO_CUSTOMIZATION_PERCENTAGES
      ],
    )

  $: currency_rate =
    selected_currency === 'EUR'
      ? 1
      : $exchange_rates_store[selected_currency]

  $: video_cost_with_customization_in_selected_currency =
    convert_currency(video_cost_with_customization, currency_rate)
</script>

<div class="flex flex-col">
  <label>
    Video duration:
    <select
      bind:value={selected_video_duration}
      class="select select-bordered select-sm text-base"
    >
      {#each Object.keys(VIDEO_DURATION) as duration}
        <option value={duration}>{duration}</option>
      {/each}
    </select>
  </label>
  <label>
    Customization level:
    <select
      bind:value={selected_customization_level}
      class="select select-bordered select-sm text-base"
    >
      {#each CUSTOMIZATION_LEVEL_OPTIONS as level}
        <option value={level}>{level}</option>
      {/each}
    </select>
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
  <p>
    Total cost: {locale_string(
      video_cost_with_customization_in_selected_currency,
    )}
    {selected_currency}
  </p>
</div>

<div
  class="stats stats-vertical md:stats-horizontal shadow-lg border border-secondary w-full mt-10"
>
  <div class="stat">
    <div class="stat-title">Length</div>
    <div class="stat-value flex">
      {selected_duration}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Customisation</div>
    <div class="stat-value flex">
      {selected_customization_level}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Total</div>
    <div class="stat-value flex">
      {locale_string(
        video_cost_with_customization_in_selected_currency,
      )}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</div>
