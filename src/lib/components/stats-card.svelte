<script lang="ts">
  import { number_crunch } from '$lib/utils'
  import { format, startOfMonth, startOfYear } from 'date-fns'

  type Nullable<T> = T | null | undefined
  interface Props {
    daily_visits: Nullable<AnalyticsData>
    monthly_visits: Nullable<AnalyticsData>
    yearly_visits: Nullable<AnalyticsData>
  }

  const { daily_visits, monthly_visits, yearly_visits } =
    $props<Props>()

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
    stats_data: AnalyticsData | AnalyticsData[] | null | undefined,
  ) => {
    let data
    if (Array.isArray(stats_data)) {
      if (stats_data.length === 0) return null
      data = stats_data[0]
    } else {
      data = stats_data
    }

    if (!data) return null
    const time_period_config = time_periods[time_period]
    const time_period_label = time_period_config.label
    const time_period_range = time_period_config.range || ''
    return {
      views: {
        label: `Views ${time_period_label}`,
        value: number_crunch(data.pageviews) ?? '0',
        range: time_period_range,
      },
      visitors: {
        label: `Visitors ${time_period_label}`,
        value: number_crunch(data.uniques) ?? '0',
        range: time_period_range,
      },
      entries: {
        label: `Entries ${time_period_label}`,
        value: number_crunch(data.visits) ?? '0',
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

  interface StatValue {
    label: string
    value: string
    range: string
  }

  interface Stats {
    views: StatValue
    visitors: StatValue
    entries: StatValue
  }

  const has_data = (stats: Stats | null): boolean => {
    return stats
      ? stats.views.value !== '0' ||
          stats.visitors.value !== '0' ||
          stats.entries.value !== '0'
      : false
  }
</script>

{#if !daily_visits && !monthly_visits && !yearly_visits}
  <section class="p-6" aria-labelledby="analytics-section">
    <header>
      <h3>Sorry, no data for this post.</h3>
    </header>
  </section>
{:else}
  <section class="px-6 pt-6" aria-labelledby="analytics-section">
    <p id="analytics-section" class="sr-only">
      Analytics Information
    </p>
    {#each stats_array as { title, stats }}
      {#if has_data(stats)}
        <article>
          <header class="mb-2 pl-1">
            <h3>{title}</h3>
          </header>
          <section
            class="stats stats-vertical md:stats-horizontal shadow-lg w-full border border-secondary mb-8"
          >
            {#if stats}
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
            {/if}
          </section>
        </article>
      {/if}
    {/each}
  </section>
{/if}
