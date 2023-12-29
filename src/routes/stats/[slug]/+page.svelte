<script lang="ts">
  import { StatsCard } from '$lib/components'

  const { data } = $props()
</script>

<StatsCard
  daily_visits={data.analytics.daily_visits}
  monthly_visits={data.analytics.monthly_visits}
  yearly_visits={data.analytics.yearly_visits}
/>
