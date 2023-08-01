<script lang="ts">
  import {
    VIDEO_CUSTOMIZATION_PERCENTAGES,
    VIDEO_DURATIONS,
    calculate_cost_with_customization,
    convert_currency,
  } from './pricing'

  let selected_video_duration = Object.keys(VIDEO_DURATIONS)[0]
  let selected_customization_level = Object.keys(
    VIDEO_CUSTOMIZATION_PERCENTAGES,
  )[0]
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
      {#each Object.keys(VIDEO_DURATIONS) as duration}
        <option value={duration}>{duration}</option>
      {/each}
    </select>
  </label>
  <label>
    Customization level:
    <select bind:value={selected_customization_level} class="select">
      {#each Object.keys(VIDEO_CUSTOMIZATION_PERCENTAGES) as level}
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
