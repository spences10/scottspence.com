<script lang="ts">
  import { number_crunch } from '$lib/utils'
  import { format, startOfMonth, startOfYear } from 'date-fns'

  export let daily_visits: AnalyticsData | null | undefined
  export let monthly_visits: AnalyticsData | null | undefined
  export let yearly_visits: AnalyticsData | null | undefined

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
    month: {
      label: 'This Month',
      range: `${format(
        startOfMonth(new Date()),
        'MMM d, yyyy',
      )} - ${format(new Date(), 'MMM d, yyyy')}`,
    },
    year: {
      label: 'This Year',
      range: `${format(
        startOfYear(new Date()),
        'MMM d, yyyy',
      )} - ${format(new Date(), 'MMM d, yyyy')}`,
    },
  }

  const generate_stats = (
    time_period: string,
    stats_data: AnalyticsData | null | undefined,
  ) => {
    if (!stats_data) return null
    const time_period_config = time_periods[time_period]
    const time_period_label = time_period_config.label
    const time_period_range = time_period_config.range || ''
    return {
      views: {
        label: `Views ${time_period_label}`,
        value: number_crunch(stats_data.pageviews) ?? '0',
        range: time_period_range,
      },
      visitors: {
        label: `Visitors ${time_period_label}`,
        value: number_crunch(stats_data.uniques) ?? '0',
        range: time_period_range,
      },
      entries: {
        label: `Entries ${time_period_label}`,
        value: number_crunch(stats_data.visits) ?? '0',
        range: time_period_range,
      },
    }
  }

  const daily_stats = generate_stats('day', daily_visits)
  const monthly_stats = generate_stats('month', monthly_visits)
  const yearly_stats = generate_stats('year', yearly_visits)

  const stats_array = [
    { title: 'Daily analytics for this post', stats: daily_stats },
    {
      title: 'Monthly analytics for this post',
      stats: monthly_stats,
    },
    { title: 'Yearly analytics for this post', stats: yearly_stats },
  ]
</script>

<section aria-labelledby="analytics-section">
  <h2 id="analytics-section" class="sr-only">
    Analytics Information
  </h2>
  {#each stats_array as { title, stats }}
    {#if stats}
      <article class="mb-4">
        <header class="mb-2 pl-1">
          <h3>{title}</h3>
        </header>
        <section
          class="stats stats-vertical md:stats-horizontal shadow-lg w-full border border-secondary mb-8"
        >
          {#each Object.entries(stats) as [key, { label, value, range }]}
            <div class="stat">
              <header class="stat-title">{label}</header>
              <div class="stat-value text-2xl" role="status">
                {value}
              </div>
              {#if range}
                <footer class="stat-desc">{range}</footer>
              {/if}
            </div>
          {/each}
        </section>
      </article>
    {/if}
  {/each}
</section>
