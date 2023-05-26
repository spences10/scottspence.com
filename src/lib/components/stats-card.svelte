<script lang="ts">
  import { number_crunch } from '$lib/utils'
  import { format, startOfMonth, startOfYear } from 'date-fns'

  export let stats
  export let title: string
  export let time_period = 'day'

  const time_periods: {
    [key: string]: {
      label: string
      range?: string
    }
  } = {
    day: {
      label: 'Today',
      range: format(new Date(), 'MMM d, yyyy h:mm a'),
    },
    week: {
      label: 'This Week',
    },
    month: {
      label: 'This Month',
      range: `${format(
        startOfMonth(new Date()),
        'MMM d, yyyy'
      )} - ${format(new Date(), 'MMM d, yyyy')}`,
    },
    year: {
      label: 'This Year',
      range: `${format(
        startOfYear(new Date()),
        'MMM d, yyyy'
      )} - ${format(new Date(), 'MMM d, yyyy')}`,
    },
  }

  const time_period_config =
    time_periods[time_period] || time_periods.day
  const time_period_label = time_period_config.label
  const time_period_range = time_period_config.range || ''

  export const formatted_stats = {
    views: {
      label: `Views ${time_period_label}`,
      value: number_crunch(stats.pageviews) ?? '0',
      range: time_period_range,
    },
    visitors: {
      label: `Visitors ${time_period_label}`,
      value: number_crunch(stats.uniques) ?? '0',
      range: time_period_range,
    },
    entries: {
      label: `Entries ${time_period_label}`,
      value: number_crunch(stats.visits) ?? '0',
      range: time_period_range,
    },
  }
</script>

<p class="mb-2 pl-1">{title}</p>

<div
  class="stats stats-vertical md:stats-horizontal shadow-lg w-full border border-secondary mb-8"
>
  {#each Object.entries(formatted_stats) as [key, { label, value, range }]}
    <div class="stat">
      <div class="stat-title">{label}</div>
      <div class="stat-value text-2xl">{value}</div>
      {#if range}
        <div class="stat-desc">{range}</div>
      {/if}
    </div>
  {/each}
</div>
