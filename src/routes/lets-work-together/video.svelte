<script lang="ts">
  import {
    VIDEO_CUSTOMIZATION_PERCENTAGES,
    VIDEO_DURATIONS,
    calculate_cost_with_customization,
    convert_currency,
  } from './pricing'

  const VIDEO_DURATION_OPTIONS = Object.keys(VIDEO_DURATIONS)
  const CUSTOMIZATION_LEVEL_OPTIONS = Object.keys(
    VIDEO_CUSTOMIZATION_PERCENTAGES,
  )

  let selected_video_duration = VIDEO_DURATION_OPTIONS[0]
  let selected_customization_level = CUSTOMIZATION_LEVEL_OPTIONS[0]
  let selected_currency = 'EUR'

  $: video_cost =
    VIDEO_DURATIONS[
      selected_video_duration as keyof typeof VIDEO_DURATIONS
    ]
  $: video_cost_with_customization =
    calculate_cost_with_customization(
      video_cost,
      VIDEO_CUSTOMIZATION_PERCENTAGES[
        selected_customization_level as keyof typeof VIDEO_CUSTOMIZATION_PERCENTAGES
      ],
    )
  $: video_cost_with_customization_in_selected_currency =
    convert_currency(video_cost_with_customization, selected_currency)
</script>

<div class="flex flex-col">
  <label>
    Video duration:
    <select bind:value={selected_video_duration} class="select">
      {#each VIDEO_DURATION_OPTIONS as duration}
        <option value={duration}>{duration}</option>
      {/each}
    </select>
  </label>
  <label>
    Customization level:
    <select bind:value={selected_customization_level} class="select">
      {#each CUSTOMIZATION_LEVEL_OPTIONS as level}
        <option value={level}>{level}</option>
      {/each}
    </select>
  </label>
  <label>
    Currency:
    <select bind:value={selected_currency} class="select">
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
    </select>
  </label>
  <p>
    Total cost: {video_cost_with_customization_in_selected_currency.toLocaleString(
      undefined,
      { maximumFractionDigits: 0 },
    )}
    {selected_currency}
  </p>
</div>
