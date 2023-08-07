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

  export const BLOG_POST_LENGTH = {
    Short: {
      description: '<1k words',
      cost:
        calculate_day_rate(annual_rate_EUR, working_days_in_year) * 1,
    },
    Medium: {
      description: '1k-2k words',
      cost:
        calculate_day_rate(annual_rate_EUR, working_days_in_year) * 2,
    },
    Long: {
      description: '>2k words',
      cost:
        calculate_day_rate(annual_rate_EUR, working_days_in_year) * 3,
    },
  }

  export const BLOG_POST_DEPTH = {
    Overview: 0,
    'In-depth': 0.5, // 50% extra
    Series: 0.4, // 40% extra
  }

  let selected_post_length = Object.keys(BLOG_POST_LENGTH)[0]
  let selected_post_depth = Object.keys(BLOG_POST_DEPTH)[0]
  let selected_currency = 'EUR'
  let selected_length_description = 'Short'

  // function to calculate cost with depth
  export const calculate_cost_with_depth = (
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

  $: post_cost_with_depth_in_selected_currency = convert_currency(
    post_cost_with_depth,
    currency_rate,
  )
</script>

<div class="flex flex-col">
  <label>
    Blog Post Length:
    <select
      bind:value={selected_post_length}
      class="select select-bordered select-sm text-base"
    >
      {#each Object.keys(BLOG_POST_LENGTH) as length}
        <option value={length}>{length}</option>
      {/each}
    </select>
  </label>
  <label>
    Blog Post Depth:
    <select
      bind:value={selected_post_depth}
      class="select select-bordered select-sm text-base"
    >
      {#each Object.keys(BLOG_POST_DEPTH) as depth}
        <option value={depth}>{depth}</option>
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
      post_cost_with_depth_in_selected_currency,
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
</div>
