<script lang="ts">
	import {
		HistoricalStats,
		LiveDashboard,
		PeriodStats,
	} from '$lib/components/stats'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { og_image_url } from '$lib/utils'
	import { Head } from 'svead'

	let { data } = $props()
	const site_stats = $derived(data.site_stats)
	const current_month = $derived(data.current_month)
	const current_year = $derived(data.current_year)
	const error = $derived(data.error)

	const seo_config = create_seo_config({
		title: `Site Stats - ${name}`,
		description: `View stats for ${name}'s blog posts and articles`,
		open_graph_image: og_image_url(
			name,
			'scottspence.com',
			'Site Stats',
		),
		url: `${website}/stats`,
		slug: 'stats',
	})
</script>

<Head {seo_config} />

{#if error}
	<div class="alert alert-error mb-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-6 w-6 shrink-0 stroke-current"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		</svg>
		<span>{error}</span>
	</div>
{/if}

{#if site_stats.length === 0 && !error}
	<div class="alert alert-info mb-4">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			class="h-6 w-6 shrink-0 stroke-current"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<span>No stats data available yet.</span>
	</div>
{/if}

<LiveDashboard />
<PeriodStats />

{#if site_stats.length > 0}
	<HistoricalStats {site_stats} {current_month} {current_year} />
{/if}
