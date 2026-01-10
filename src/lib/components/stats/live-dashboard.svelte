<script lang="ts">
	import { get_live_stats_breakdown } from '$lib/analytics/live-analytics.remote'
	import { number_crunch } from '$lib/utils'
	import { onMount } from 'svelte'
	import StatRow from './stat-row.svelte'
	import {
		country_flag,
		device_icon,
		format_path,
		type LiveStats,
	} from './stats.svelte'

	let live_stats = $state<LiveStats | null>(null)
	let live_loading = $state(true)

	const fetch_live_data = async () => {
		try {
			live_stats = await get_live_stats_breakdown()
		} catch (e) {
			console.error('[stats] Failed to fetch live data:', e)
		} finally {
			live_loading = false
		}
	}

	onMount(() => {
		fetch_live_data()
		const interval = setInterval(fetch_live_data, 10000) // 10s refresh
		return () => clearInterval(interval)
	})
</script>

<!-- Page header with live indicator -->
<div class="mb-8 flex items-center justify-between">
	<h1 class="text-3xl font-bold">Site Stats</h1>
	{#if !live_loading && live_stats}
		<div class="flex items-center gap-2">
			<div class="inline-grid *:[grid-area:1/1]">
				<div
					class="status status-primary h-3 w-3 animate-ping [animation-duration:2s]"
				></div>
				<div class="status status-primary h-3 w-3"></div>
			</div>
			<span class="text-primary text-lg font-bold tabular-nums">
				{live_stats.active_visitors}
			</span>
			<span class="text-base-content/60 text-sm">now</span>
		</div>
	{/if}
</div>

<!-- Live dashboard grid -->
{#if live_loading}
	<div class="flex items-center justify-center py-12">
		<div class="loading loading-spinner loading-lg"></div>
	</div>
{:else if live_stats}
	<!-- Stats cards row -->
	<div
		class="stats stats-vertical border-secondary md:stats-horizontal mb-8 w-full border shadow-lg"
	>
		<div class="stat">
			<div class="stat-title">Active Now</div>
			<div class="stat-value text-primary">
				{live_stats.active_visitors}
			</div>
			<div class="stat-desc">Current visitors</div>
		</div>
		<div class="stat">
			<div class="stat-title">Last 5 mins</div>
			<div class="stat-value text-secondary">
				{live_stats.recent_visitors}
			</div>
			<div class="stat-desc">Unique visitors</div>
		</div>
		<div class="stat">
			<div class="stat-title">Countries</div>
			<div class="stat-value text-accent">
				{live_stats.countries.length}
			</div>
			<div class="stat-desc">Represented</div>
		</div>
		<div class="stat">
			<div class="stat-title">Active Pages</div>
			<div class="stat-value text-info">
				{live_stats.top_paths.length}
			</div>
			<div class="stat-desc">Being viewed</div>
		</div>
	</div>

	<!-- Main grid: Countries + Active Pages -->
	<div class="mb-8 grid gap-6 lg:grid-cols-2">
		<!-- Countries -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<h2 class="card-title text-lg">Visitors by Country</h2>
				{#if live_stats.countries.length > 0}
					{@const max_visitors = Math.max(
						...live_stats.countries.map((c) => c.visitors),
					)}
					<ul class="space-y-1">
						{#each live_stats.countries as c}
							<li
								class="relative flex items-center justify-between gap-2 py-1.5"
							>
								<div
									class="bg-primary/20 absolute inset-y-0 left-0 rounded"
									style="width: {(c.visitors / max_visitors) * 100}%"
								></div>
								<span class="relative flex items-center gap-2">
									<span class="text-xl">
										{country_flag(c.country)}
									</span>
									<span class="uppercase">{c.country}</span>
								</span>
								<span class="badge badge-ghost relative tabular-nums">
									{number_crunch(c.visitors)}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data yet</p>
				{/if}
			</div>
		</div>

		<!-- Active Pages -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<h2 class="card-title text-lg">Top Pages</h2>
				{#if live_stats.top_paths.length > 0}
					{@const max_visitors = Math.max(
						...live_stats.top_paths
							.slice(0, 8)
							.map((p) => p.visitors),
					)}
					<ul class="space-y-1">
						{#each live_stats.top_paths.slice(0, 8) as page}
							<StatRow
								label={format_path(page.path)}
								value={page.visitors}
								max_value={max_visitors}
								href={page.path}
							/>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No activity</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Secondary grid: Browsers + Devices -->
	<div class="mb-8 grid gap-6 md:grid-cols-2">
		<!-- Browsers -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<h2 class="card-title text-base">Browsers</h2>
				{#if live_stats.browsers.length > 0}
					{@const max_visitors = Math.max(
						...live_stats.browsers.map((b) => b.visitors),
					)}
					<ul class="space-y-1">
						{#each live_stats.browsers as b}
							<StatRow
								label={b.browser}
								value={b.visitors}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>

		<!-- Devices -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<h2 class="card-title text-base">Devices</h2>
				{#if live_stats.devices.length > 0}
					{@const max_visitors = Math.max(
						...live_stats.devices.map((d) => d.visitors),
					)}
					<ul class="space-y-1">
						{#each live_stats.devices as d}
							<li
								class="relative flex items-center justify-between gap-2 py-1.5"
							>
								<div
									class="bg-primary/20 absolute inset-y-0 left-0 rounded"
									style="width: {(d.visitors / max_visitors) * 100}%"
								></div>
								<span class="relative flex items-center gap-1">
									<span>{device_icon(d.device_type)}</span>
									<span class="capitalize">{d.device_type}</span>
								</span>
								<span class="badge badge-ghost relative tabular-nums">
									{number_crunch(d.visitors)}
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>
	</div>

	<p class="text-base-content/50 mb-8 text-center text-xs">
		Live data refreshes every 10 seconds
	</p>
{/if}
