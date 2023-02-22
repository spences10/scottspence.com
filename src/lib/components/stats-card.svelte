<script>
  import { number_crunch } from '$lib/utils'
  import { format, startOfMonth, startOfYear } from 'date-fns'

  export let stats
  export let title
  export let time_period = 'day'

  let time_period_label = 'Today'
  let time_period_range
  if (time_period === 'day') {
    time_period_label = 'Today'
    time_period_range = format(new Date(), 'MMM d, yyyy h:mm a')
  }
  if (time_period === 'week') time_period_label = 'This Week'
  if (time_period === 'month') {
    time_period_label = 'This Month'
    time_period_range = `${format(
      startOfMonth(new Date()),
      'MMM d, yyyy'
    )} - ${format(new Date(), 'MMM d, yyyy')}`
  }
  if (time_period === 'year') {
    time_period_label = 'This Year'
    time_period_range = `${format(
      startOfYear(new Date()),
      'MMM d, yyyy'
    )} - ${format(new Date(), 'MMM d, yyyy')}`
  }
</script>

<pre>{JSON.stringify(stats, null, 2)}</pre>

<p class="mb-2 pl-1">{title}</p>

<div
  class="stats stats-vertical md:stats-horizontal shadow-lg w-full border border-secondary mb-8"
>
  <div class="stat">
    <div class="stat-title">Visits {time_period_label}</div>
    <div class="stat-value text-2xl">
      {number_crunch(stats.visits)}
    </div>
    <div class="stat-desc">{time_period_range}</div>
  </div>

  <div class="stat">
    <div class="stat-title">Unique Visitors {time_period_label}</div>
    <div class="stat-value text-2xl">
      {number_crunch(stats.uniques)}
    </div>
    <div class="stat-desc">
      {time_period_range}
    </div>
  </div>

  <div class="stat">
    <div class="stat-title">Total Views {time_period_label}</div>
    <div class="stat-value text-2xl">
      {number_crunch(stats.pageviews)}
    </div>
    <div class="stat-desc">{time_period_range}</div>
  </div>
</div>
