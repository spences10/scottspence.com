<script lang="ts">
  import { exchange_rates_store, locale_string } from '.'
  import {
    VIDEO_CUSTOMIZATION_PERCENTAGES,
    VIDEO_DURATION,
    calculate_cost_with_customization,
    convert_currency,
  } from './pricing'

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
