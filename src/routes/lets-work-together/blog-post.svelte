<script lang="ts">
  import CurrencySelect from './currency-select.svelte'
  import Select from './select.svelte'
  import { exchange_rates_store, get_field_value } from './stores'
  import { calculate_day_rate_with_pto, locale_string } from './utils'

  let annual_rate_EUR = get_field_value('ANNUAL_RATE_EUR') || 0
  let working_days_in_year =
    get_field_value('WORKING_DAYS_IN_YEAR') || 0

  const BLOG_POST_LENGTH = {
    Short: {
      description: '<1k words',
      cost:
        calculate_day_rate_with_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 1,
    },
    Medium: {
      description: '1k-2k words',
      cost:
        calculate_day_rate_with_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 2,
    },
    Long: {
      description: '>2k words',
      cost:
        calculate_day_rate_with_pto(
          annual_rate_EUR,
          working_days_in_year,
        ) * 3,
    },
  }

  const BLOG_POST_DEPTH = {
    Overview: 0,
    'In-depth': 0.5, // 50% extra
    Series: 0.4, // 40% extra
  }

  let selected_post_length = Object.keys(BLOG_POST_LENGTH)[0]
  let selected_post_depth = Object.keys(BLOG_POST_DEPTH)[0]
  let selected_currency = 'EUR'
  let selected_length_description = 'Short'

  // function to calculate cost with depth
  const calculate_cost_with_depth = (
    base_cost: number,
    depth_percentage: number,
  ) => base_cost * (1 + depth_percentage)

  $: selected_length_description =
    BLOG_POST_LENGTH[
      selected_post_length as keyof typeof BLOG_POST_LENGTH
    ].description

  $: post_cost =
    BLOG_POST_LENGTH[
      selected_post_length as keyof typeof BLOG_POST_LENGTH
    ].cost

  $: post_cost_with_depth = calculate_cost_with_depth(
    post_cost,
    BLOG_POST_DEPTH[
      selected_post_depth as keyof typeof BLOG_POST_DEPTH
    ],
  )

  $: currency_rate =
    selected_currency === 'EUR'
      ? 1
      : $exchange_rates_store[selected_currency]

  $: post_cost_with_depth_in_selected_currency =
    post_cost_with_depth * currency_rate
</script>

<section aria-label="Blog Post Configuration">
  <fieldset>
    <Select
      id="post_duration"
      label="Blog Post Length:"
      bind:selected={selected_post_length}
      options={Object.keys(BLOG_POST_LENGTH)}
    />
    <Select
      id="post_depth"
      label="Blog Post Depth:"
      bind:selected={selected_post_depth}
      options={Object.keys(BLOG_POST_DEPTH)}
    />

    <CurrencySelect bind:selected_currency />
  </fieldset>
</section>

<section
  aria-label="Blog post stats"
  class="stats stats-vertical md:stats-horizontal shadow-lg border border-secondary w-full mb-5"
>
  <div class="stat">
    <div class="stat-title">Length</div>
    <div class="stat-value flex">
      {selected_length_description}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Depth</div>
    <div class="stat-value flex">
      {selected_post_depth}
    </div>
  </div>
  <div class="stat">
    <div class="stat-title">Total</div>
    <div class="stat-value flex">
      {locale_string(post_cost_with_depth_in_selected_currency)}
      <span class="text-xl ml-2">
        {selected_currency}
      </span>
    </div>
  </div>
</section>
