<script lang="ts">
  import CurrencySelect from './currency-select.svelte'
  import Select from './select.svelte'
  import { exchange_rates_store, get_field_value } from './stores'
  import { calculate_day_rate_with_pto, locale_string } from './utils'

  let annual_rate_EUR = get_field_value('ANNUAL_RATE_EUR') || 0
  let working_days_in_year =
    get_field_value('WORKING_DAYS_IN_YEAR') || 0

  const calculate_cost_with_customisation = (
    base_cost: number,
    customisation_percentage: number,
  ) => base_cost * (1 + customisation_percentage)

  const calculate_cost = (multiplier: number) =>
    calculate_day_rate_with_pto(
      annual_rate_EUR,
      working_days_in_year,
    ) * multiplier

  const VIDEO_DURATION = {
    Short: { description: '5-10 min', cost: calculate_cost(1.5) },
    Medium: { description: '10-20 min', cost: calculate_cost(2.5) },
    Long: { description: '20-30 min', cost: calculate_cost(3.6) },
    'Extra Long': {
      description: '>30 min',
      cost: calculate_cost(4.8),
    },
  }

  const VIDEO_CUSTOMISATION_PERCENTAGES = {
    None: 0,
    Minor: 0.3, // 30% extra
    Moderate: 0.5, // 50% extra
    Major: 1.1, // 110% extra
  }

  const VIDEO_DURATION_OPTIONS = Object.keys(VIDEO_DURATION)
  const CUSTOMISATION_LEVEL_OPTIONS = Object.keys(
    VIDEO_CUSTOMISATION_PERCENTAGES,
  )

  let selected_video_duration = VIDEO_DURATION_OPTIONS[0]
  let selected_customisation_level = CUSTOMISATION_LEVEL_OPTIONS[0]
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
  $: video_cost_with_customisation =
    calculate_cost_with_customisation(
      video_cost,
      VIDEO_CUSTOMISATION_PERCENTAGES[
        selected_customisation_level as keyof typeof VIDEO_CUSTOMISATION_PERCENTAGES
      ],
    )

  $: currency_rate =
    selected_currency === 'EUR'
      ? 1
      : $exchange_rates_store[selected_currency]

  $: video_cost_with_customisation_in_selected_currency =
    video_cost_with_customisation * currency_rate
</script>

<section class="flex flex-col">
  <fieldset>
    <Select
      id="duration"
      label="Video duration:"
      bind:selected={selected_video_duration}
      options={VIDEO_DURATION_OPTIONS}
    />

    <Select
      id="customisation_level"
      label="Customisation level:"
      bind:selected={selected_customisation_level}
      options={CUSTOMISATION_LEVEL_OPTIONS}
    />

    <CurrencySelect bind:selected_currency />
  </fieldset>
</section>

<section
  class="stats stats-vertical md:stats-horizontal shadow-lg border border-secondary w-full mb-5"
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
      {selected_customisation_level}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Total</div>
    <div class="stat-value flex">
      {locale_string(
        video_cost_with_customisation_in_selected_currency,
      )}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</section>
