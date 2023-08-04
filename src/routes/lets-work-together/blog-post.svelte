<script lang="ts">
  import { locale_string } from '.'
  import {
    BLOG_POST_DEPTH,
    BLOG_POST_LENGTH,
    calculate_cost_with_depth,
    convert_currency,
  } from './pricing'

  let selected_post_length = Object.keys(BLOG_POST_LENGTH)[0]
  let selected_post_depth = Object.keys(BLOG_POST_DEPTH)[0]
  let selected_currency = 'EUR'
  let selected_length_description = 'Short'

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
  $: post_cost_with_depth_in_selected_currency = convert_currency(
    post_cost_with_depth,
    selected_currency,
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
      <option value="USD">USD</option>
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
