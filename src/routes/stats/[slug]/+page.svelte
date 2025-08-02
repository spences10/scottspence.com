<script lang="ts">
	import { page } from '$app/state'
	import { StatsCard } from '$lib/components'
	import { name } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'

	const { data } = $props()

	const slug = page.params.slug

	const seo_config = create_seo_config({
		title: `Page stats for ${slug}`,
		description: `Pageview stats for ${slug}`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Page stats for ${slug}`,
		),
		url: page.url.toString(),
		slug: `stats/${slug}`,
	})
</script>

<Head {seo_config} />

{#if data.analytics}
	<StatsCard
		daily_visits={data.analytics.daily}
		monthly_visits={data.analytics.monthly}
		yearly_visits={data.analytics.yearly}
	/>
{:else}
	<p>No analytics data available for this post.</p>
{/if}
