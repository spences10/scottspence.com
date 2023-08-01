<script lang="ts">
  import {
    BLOG_POST_LENGTH,
    BLOG_POST_DEPTH,
    calculate_cost_with_depth,
    convert_currency,
  } from './pricing'

  let selected_post_length = Object.keys(BLOG_POST_LENGTH)[0]
  let selected_post_depth = Object.keys(BLOG_POST_DEPTH)[0]
  let selected_currency = 'EUR'

  $: post_cost = BLOG_POST_LENGTH[selected_post_length as keyof typeof BLOG_POST_LENGTH]
  $: post_cost_with_depth = calculate_cost_with_depth(
    post_cost,
    BLOG_POST_DEPTH[selected_post_depth as keyof typeof BLOG_POST_DEPTH],
  )
  $: post_cost_with_depth_in_selected_currency = convert_currency(
    post_cost_with_depth,
    selected_currency,
  )
</script>

<div class="flex flex-col">
  <label>
    Blog Post Length:
    <select bind:value={selected_post_length} class="select">
      {#each Object.keys(BLOG_POST_LENGTH) as length}
        <option value={length}>{length}</option>
      {/each}
    </select>
  </label>
  <label>
    Blog Post Depth:
    <select bind:value={selected_post_depth} class="select">
      {#each Object.keys(BLOG_POST_DEPTH) as depth}
        <option value={depth}>{depth}</option>
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
    Total cost: {post_cost_with_depth_in_selected_currency.toLocaleString(
      undefined,
      { maximumFractionDigits: 0 },
    )} {selected_currency}
  </p>
</div>
