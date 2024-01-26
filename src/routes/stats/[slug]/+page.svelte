<script lang="ts">
  import { page } from '$app/stores'
  import { Head, StatsCard } from '$lib/components'
  import { name } from '$lib/info.js'
  import { og_image_url } from '$lib/utils'

  const { data } = $props()
</script>

<Head
  title={`Page stats for ${data.analytics.yearly_visits.slug}`}
  description={`Pageview stats for ${data.analytics.yearly_visits.slug}`}
  image={og_image_url(
    name,
    `scottspence.com`,
    `Page stats for ${data.analytics.yearly_visits.slug}`,
  )}
  url={$page.url.toString()}
/>

<StatsCard
  daily_visits={data.analytics.daily_visits}
  monthly_visits={data.analytics.monthly_visits}
  yearly_visits={data.analytics.yearly_visits}
/>
