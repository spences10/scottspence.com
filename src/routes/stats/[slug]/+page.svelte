<script lang="ts">
  import { page } from '$app/stores'
  import { StatsCard } from '$lib/components'
  import { name } from '$lib/info'
  import { create_seo_config } from '$lib/seo'
  import { og_image_url } from '$lib/utils'
  import { Head } from 'svead'

  const { data } = $props()

  const seo_config = create_seo_config({
    title: `Page stats for ${data.analytics.yearly_visits.slug}`,
    description: `Pageview stats for ${data.analytics.yearly_visits.slug}`,
    open_graph_image: og_image_url(
      name,
      `scottspence.com`,
      `Page stats for ${data.analytics.yearly_visits.slug}`,
    ),
    url: $page.url.toString(),
    slug: `stats/${data.analytics.yearly_visits.slug}`,
  })
</script>

<Head {seo_config} />

<StatsCard
  daily_visits={data.analytics.daily_visits}
  monthly_visits={data.analytics.monthly_visits}
  yearly_visits={data.analytics.yearly_visits}
/>
