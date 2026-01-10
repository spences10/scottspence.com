<script lang="ts">
	import {
		get_chart_data,
		type ChartData,
	} from '$lib/analytics/chart-data.remote'
	import {
		get_period_stats,
		type FilterMode,
		type PeriodStats,
		type StatsPeriod,
	} from '$lib/analytics/period-stats.remote'
	import { InformationCircle } from '$lib/icons'
	import { number_crunch } from '$lib/utils'
	import { scaleTime } from 'd3-scale'
	import { Area, Axis, Chart, Svg, Tooltip } from 'layerchart'
	import StatRowMulti from './stat-row-multi.svelte'
	import {
		country_flag,
		device_icon,
		format_path,
		parse_referrer,
		period_labels,
	} from './stats.svelte'

	let period_stats = $state<PeriodStats | null>(null)
	let chart_data = $state<ChartData | null>(null)
	let period_loading = $state(false)
	let selected_stats_period = $state<StatsPeriod>('today')
	let selected_filter_mode = $state<FilterMode>('humans')

	const fetch_period_data = async (
		period: StatsPeriod,
		filter_mode: FilterMode,
	) => {
		period_loading = true
		try {
			const [stats, chart] = await Promise.all([
				get_period_stats({ period, filter_mode }),
				get_chart_data({ period, filter_mode }),
			])
			period_stats = stats
			chart_data = chart
		} catch (e) {
			console.error('[stats] Failed to fetch period data:', e)
		} finally {
			period_loading = false
		}
	}

	// Reactive: fetch when period or filter mode changes
	$effect(() => {
		fetch_period_data(selected_stats_period, selected_filter_mode)
	})

	// Convert chart data timestamps to Date objects for scaleTime
	let chart_data_parsed = $derived.by(() => {
		if (!chart_data) return []
		return chart_data.data_points.map((point) => ({
			...point,
			date: new Date(point.timestamp),
		}))
	})

	// Flatten chart data for multi-series (views + visitors)
	let chart_data_multi = $derived.by(() => {
		if (!chart_data_parsed.length) return []
		return chart_data_parsed.flatMap((point) => [
			{
				date: point.date,
				value: point.visitors,
				series: 'visitors',
				timestamp: point.timestamp,
			},
			{
				date: point.date,
				value: point.views,
				series: 'views',
				timestamp: point.timestamp,
			},
		])
	})

	// Group by series for rendering
	let chart_series_data = $derived.by(() => {
		if (!chart_data_parsed.length) return { visitors: [], views: [] }
		return {
			visitors: chart_data_parsed.map((p) => ({
				date: p.date,
				value: p.visitors,
				timestamp: p.timestamp,
			})),
			views: chart_data_parsed.map((p) => ({
				date: p.date,
				value: p.views,
				timestamp: p.timestamp,
			})),
		}
	})
</script>

<!-- Period Stats Section -->
<div class="divider mb-8">Period Stats</div>

<!-- Filter info alert -->
<div class="alert mb-6">
	<InformationCircle />
	<div class="text-sm">
		<p>
			<strong>Bot filtering:</strong> Detects bots via user-agent patterns
			(crawlers, scripts) and behaviour analysis (20+ hits/page or 100+
			total/day). Historical data is filtered overnight; current day filtering
			is applied in real-time.
		</p>
	</div>
</div>

<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
	<!-- Period selector -->
	<div class="flex flex-wrap items-center gap-2">
		{#each ['today', 'yesterday', 'week', 'month', 'year'] as period (period)}
			<button
				class="btn btn-sm {selected_stats_period === period
					? 'btn-primary'
					: 'btn-ghost'}"
				onclick={() =>
					(selected_stats_period = period as StatsPeriod)}
			>
				{period_labels[period as StatsPeriod]}
			</button>
		{/each}
	</div>

	<!-- Filter mode toggle -->
	<div class="join">
		<button
			class="btn join-item btn-sm {selected_filter_mode === 'humans'
				? 'btn-success'
				: 'btn-ghost'}"
			onclick={() => (selected_filter_mode = 'humans')}
		>
			Humans
		</button>
		<button
			class="btn join-item btn-sm {selected_filter_mode === 'bots'
				? 'btn-warning'
				: 'btn-ghost'}"
			onclick={() => (selected_filter_mode = 'bots')}
		>
			Bots
		</button>
		<button
			class="btn join-item btn-sm {selected_filter_mode === 'all'
				? 'btn-info'
				: 'btn-ghost'}"
			onclick={() => (selected_filter_mode = 'all')}
		>
			All
		</button>
	</div>
</div>

{#if period_loading}
	<div class="flex items-center justify-center py-8">
		<div class="loading loading-spinner loading-md"></div>
	</div>
{:else if period_stats}
	<!-- Period summary cards -->
	<div
		class="stats stats-vertical border-secondary md:stats-horizontal mb-4 w-full border shadow-lg"
	>
		<div class="stat">
			<div class="stat-title">
				{selected_filter_mode === 'bots' ? 'Bot Views' : 'Views'}
			</div>
			<div
				class="stat-value {selected_filter_mode === 'bots'
					? 'text-warning'
					: 'text-primary'}"
			>
				{number_crunch(period_stats.views)}
			</div>
			<div class="stat-desc">{period_stats.period_label}</div>
		</div>
		<div class="stat">
			<div class="stat-title">
				{selected_filter_mode === 'bots'
					? 'Bot Visitors'
					: 'Unique Visitors'}
			</div>
			<div
				class="stat-value {selected_filter_mode === 'bots'
					? 'text-warning'
					: 'text-secondary'}"
			>
				{number_crunch(period_stats.unique_visitors)}
			</div>
			<div class="stat-desc">{period_stats.period_label}</div>
		</div>
		<div class="stat">
			<div class="stat-title">Countries</div>
			<div class="stat-value text-accent">
				{period_stats.countries.length}
			</div>
			<div class="stat-desc">Represented</div>
		</div>
		<div class="stat">
			<div class="stat-title">Pages</div>
			<div class="stat-value text-info">
				{period_stats.top_pages.length}
			</div>
			<div class="stat-desc">With traffic</div>
		</div>
	</div>

	<!-- Period Area Chart -->
	{#if chart_data_parsed.length > 0}
		{@const max_value = Math.max(
			...chart_data_parsed.map((d) => Math.max(d.views, d.visitors)),
		)}
		{#key chart_data_parsed.length}
			<div class="card bg-base-200 mb-4 shadow-lg">
				<div class="card-body p-4">
					<div class="mb-2 flex gap-4 text-sm">
						<span class="flex items-center gap-1">
							<span class="bg-secondary inline-block h-2 w-4 rounded"
							></span>
							Visitors
						</span>
						<span class="flex items-center gap-1">
							<span class="bg-primary inline-block h-2 w-4 rounded"
							></span>
							Views
						</span>
					</div>
					<div class="h-48">
						<Chart
							data={chart_data_multi}
							x="date"
							xScale={scaleTime()}
							y="value"
							yDomain={[0, max_value]}
							yNice
							padding={{ left: 40, bottom: 24, right: 8, top: 8 }}
							tooltip={{ mode: 'bisect-x' }}
						>
							<Svg>
								<Axis placement="left" grid rule />
								<Axis placement="bottom" />
								<!-- Visitors area/line -->
								<Area
									data={chart_series_data.visitors}
									line={{ class: 'stroke-secondary stroke-2' }}
									class="fill-secondary/20"
								/>
								<!-- Views area/line -->
								<Area
									data={chart_series_data.views}
									line={{ class: 'stroke-primary stroke-2' }}
									class="fill-primary/20"
								/>
							</Svg>
							<Tooltip.Root>
								{#snippet children({
									data,
								}: {
									data: {
										timestamp: string
										value: number
										series: string
									}
								})}
									{@const point = chart_data_parsed.find(
										(p) => p.timestamp === data.timestamp,
									)}
									<Tooltip.Header>{data.timestamp}</Tooltip.Header>
									<Tooltip.List>
										<Tooltip.Item
											label="Visitors"
											value={number_crunch(point?.visitors ?? 0)}
										/>
										<Tooltip.Item
											label="Views"
											value={number_crunch(point?.views ?? 0)}
										/>
									</Tooltip.List>
								{/snippet}
							</Tooltip.Root>
						</Chart>
					</div>
				</div>
			</div>
		{/key}
	{/if}

	<!-- Bot stats summary (shown when viewing humans) -->
	{#if selected_filter_mode === 'humans' && period_stats.bot_views > 0}
		<div class="bg-base-200 mb-8 rounded-lg p-3 text-sm">
			<span class="text-warning font-semibold"
				>Bot traffic filtered:</span
			>
			{number_crunch(period_stats.bot_views)} views from {number_crunch(
				period_stats.bot_visitors,
			)}
			detected bots
			<span class="text-base-content/60">
				({Math.round(
					(period_stats.bot_views /
						(period_stats.views + period_stats.bot_views)) *
						100,
				)}% of total)
			</span>
		</div>
	{:else}
		<div class="mb-4"></div>
	{/if}

	<!-- Period grids -->
	<div class="mb-8 grid gap-6 lg:grid-cols-2">
		<!-- Referrers -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-lg">Referrers</h2>
					<div class="flex gap-2 text-xs opacity-60">
						<span class="w-14 text-right">Visitors</span>
						<span class="w-14 text-right">Views</span>
					</div>
				</div>
				{#if period_stats.referrers.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.referrers.map((r) => r.visitors),
					)}
					<ul class="space-y-1">
						{#each period_stats.referrers as ref}
							<StatRowMulti
								label={parse_referrer(ref.referrer)}
								visitors={ref.visitors}
								views={ref.views}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No referrer data</p>
				{/if}
			</div>
		</div>

		<!-- Countries -->
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-lg">Top Countries</h2>
					<div class="flex gap-2 text-xs opacity-60">
						<span class="w-14 text-right">Visitors</span>
						<span class="w-14 text-right">Views</span>
					</div>
				</div>
				{#if period_stats.countries.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.countries.map((c) => c.visitors),
					)}
					<ul class="space-y-1">
						{#each period_stats.countries as c}
							<li class="relative flex items-center gap-2 py-1.5">
								<div
									class="bg-primary/20 absolute inset-y-0 left-0 rounded"
									style="width: {(c.visitors / max_visitors) * 100}%"
								></div>
								<span
									class="relative flex min-w-0 flex-1 items-center gap-1.5 text-sm"
								>
									<span>{country_flag(c.country)}</span>
									<span class="truncate uppercase">{c.country}</span>
								</span>
								<span
									class="badge badge-ghost badge-sm relative w-14 justify-end tabular-nums"
								>
									{number_crunch(c.visitors)}
								</span>
								<span
									class="badge badge-outline badge-sm relative w-14 justify-end tabular-nums"
								>
									{number_crunch(c.views)}
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

	<!-- Top Pages (full width) -->
	<div class="mb-8">
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-lg">Top Pages</h2>
					<div class="flex gap-2 text-xs opacity-60">
						<span class="w-14 text-right">Visitors</span>
						<span class="w-14 text-right">Views</span>
					</div>
				</div>
				{#if period_stats.top_pages.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.top_pages
							.slice(0, 10)
							.map((p) => p.visitors),
					)}
					<ul class="space-y-1">
						{#each period_stats.top_pages.slice(0, 10) as page}
							<StatRowMulti
								label={format_path(page.path)}
								visitors={page.visitors}
								views={page.views}
								max_value={max_visitors}
								href={page.path}
							/>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Browsers + Devices -->
	<div class="mb-8 grid gap-6 md:grid-cols-2">
		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-base">Browsers</h2>
					<div class="flex gap-2 text-xs opacity-60">
						<span class="w-14 text-right">Visitors</span>
						<span class="w-14 text-right">Views</span>
					</div>
				</div>
				{#if period_stats.browsers.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.browsers.map((b) => b.visitors),
					)}
					<ul class="space-y-1">
						{#each period_stats.browsers as b}
							<StatRowMulti
								label={b.browser}
								visitors={b.visitors}
								views={b.views}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="text-base-content/50 text-sm">No data</p>
				{/if}
			</div>
		</div>

		<div class="card bg-base-200 min-w-0 overflow-hidden shadow-lg">
			<div class="card-body min-w-0 py-4">
				<div class="flex items-center justify-between">
					<h2 class="card-title text-base">Devices</h2>
					<div class="flex gap-2 text-xs opacity-60">
						<span class="w-14 text-right">Visitors</span>
						<span class="w-14 text-right">Views</span>
					</div>
				</div>
				{#if period_stats.devices.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.devices.map((d) => d.visitors),
					)}
					<ul class="space-y-1">
						{#each period_stats.devices as d}
							<li class="relative flex items-center gap-2 py-1.5">
								<div
									class="bg-primary/20 absolute inset-y-0 left-0 rounded"
									style="width: {(d.visitors / max_visitors) * 100}%"
								></div>
								<span
									class="relative flex flex-1 items-center gap-1"
								>
									<span>{device_icon(d.device_type)}</span>
									<span class="capitalize">{d.device_type}</span>
								</span>
								<span
									class="badge badge-ghost badge-sm relative w-14 justify-end tabular-nums"
								>
									{number_crunch(d.visitors)}
								</span>
								<span
									class="badge badge-outline badge-sm relative w-14 justify-end tabular-nums"
								>
									{number_crunch(d.views)}
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
{/if}
