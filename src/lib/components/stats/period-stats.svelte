<script lang="ts">
	import {
		get_chart_data,
		type ChartData,
	} from '#lib/analytics/chart-data.remote.js';
	import {
		sort_engagement_stats,
		type EngagementSortMode,
	} from '#lib/analytics/engagement-stats.helpers.js';
	import {
		get_engagement_stats,
		type EngagementStats,
	} from '#lib/analytics/engagement-stats.remote.js';
	import { get_live_stats_breakdown } from '#lib/analytics/live-analytics.remote.js';
	import {
		get_period_stats,
		type FilterMode,
		type PeriodStats,
		type StatsPeriod,
	} from '#lib/analytics/period-stats.remote.js';
	import { InformationCircle } from '#lib/icons/index.js';
	import { number_crunch } from '#lib/utils/index.js';
	import { scaleTime } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import {
		Area,
		Axis,
		Chart,
		Highlight,
		LinearGradient,
		Svg,
		Tooltip,
	} from 'layerchart';
	import LiveDashboard from './live-dashboard.svelte';
	import StatRowMulti from './stat-row-multi.svelte';
	import {
		country_flag,
		device_icon,
		parse_referrer,
		period_labels,
	} from './stats.svelte';

	let period_stats = $state<PeriodStats | null>(null);
	let chart_data = $state<ChartData | null>(null);
	let engagement_stats = $state<EngagementStats | null>(null);
	let period_loading = $state(false);
	let selected_stats_period = $state<StatsPeriod>('today');
	let selected_filter_mode = $state<FilterMode>('humans');
	let engagement_sort_mode = $state<EngagementSortMode>('clicks');

	let show_live = $state(true);

	// Shared with LiveDashboard, which handles the refresh interval
	const live_stats_query = get_live_stats_breakdown();

	const views_per_visitor = $derived(
		period_stats && period_stats.unique_visitors > 0
			? (period_stats.views / period_stats.unique_visitors).toFixed(1)
			: '0',
	);

	// Sort engagement stats based on selected mode
	const sorted_engagement_pages = $derived(
		engagement_stats
			? sort_engagement_stats(
					engagement_stats.pages,
					engagement_sort_mode,
				)
			: [],
	);

	const fetch_period_data = async (
		period: StatsPeriod,
		filter_mode: FilterMode,
	) => {
		period_loading = true;
		try {
			const [stats, chart, engagement] = await Promise.all([
				get_period_stats({ period, filter_mode }),
				get_chart_data({ period, filter_mode }),
				get_engagement_stats({ period }),
			]);
			period_stats = stats;
			chart_data = chart;
			engagement_stats = engagement;
		} catch (e) {
			console.error('[stats] Failed to fetch period data:', e);
		} finally {
			period_loading = false;
		}
	};

	// Reactive: fetch when period or filter mode changes
	$effect(() => {
		fetch_period_data(selected_stats_period, selected_filter_mode);
	});

	// Convert chart data timestamps to Date objects for scaleTime
	let chart_data_parsed = $derived.by(() => {
		if (!chart_data) return [];
		return chart_data.data_points.map((point) => ({
			...point,
			date: new Date(point.timestamp),
		}));
	});
</script>

<!-- Page header -->
<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-3xl font-bold">Site Stats</h1>

	<div class="flex flex-wrap items-center gap-2">
		<!-- Period selector -->
		<div class="join">
			{#each ['today', 'yesterday', 'week', 'month', 'year'] as period (period)}
				<button
					class="btn join-item btn-sm {selected_stats_period ===
					period
						? 'btn-primary'
						: ''}"
					aria-pressed={selected_stats_period === period}
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
					: ''}"
				aria-pressed={selected_filter_mode === 'humans'}
				onclick={() => (selected_filter_mode = 'humans')}
			>
				Humans
			</button>
			<button
				class="btn join-item btn-sm {selected_filter_mode === 'bots'
					? 'btn-warning'
					: ''}"
				aria-pressed={selected_filter_mode === 'bots'}
				onclick={() => (selected_filter_mode = 'bots')}
			>
				Bots
				{#if period_stats && period_stats.bot_views > 0}
					<span class="tabular-nums opacity-80">
						{number_crunch(period_stats.bot_views)}
					</span>
				{/if}
			</button>
			<button
				class="btn join-item btn-sm {selected_filter_mode === 'all'
					? 'btn-info'
					: ''}"
				aria-pressed={selected_filter_mode === 'all'}
				onclick={() => (selected_filter_mode = 'all')}
			>
				All
			</button>
		</div>
	</div>
</div>

<div class="mb-12 space-y-1.5">
	{#if period_stats}
		<!-- Summary strip -->
		<div
			class="relative rounded-box bg-base-200 p-4 transition-opacity sm:p-6"
			class:opacity-60={period_loading}
		>
			<div
				class="tooltip absolute tooltip-left top-2 right-2"
				data-tip="Bots are detected via user-agent patterns (crawlers, scripts) and behaviour (20+ hits per page or 100+ total per day). Historical data is filtered overnight; the current day is filtered in real time."
			>
				<button
					class="btn btn-circle btn-ghost btn-xs"
					aria-label="About bot filtering"
				>
					<InformationCircle height="18px" width="18px" />
				</button>
			</div>
			<dl
				class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6"
			>
				{#snippet summary_item(label: string, value: string | number)}
					<div class="flex flex-col-reverse">
						<dt class="text-sm opacity-80">{label}</dt>
						<dd
							class="text-5xl font-light tracking-tight tabular-nums"
						>
							{value}
						</dd>
					</div>
				{/snippet}
				<div class="flex flex-col-reverse">
					<dt class="text-sm opacity-80">Realtime</dt>
					<dd class="text-5xl font-light tracking-tight tabular-nums">
						<button
							class="cursor-pointer rounded link-hover"
							aria-expanded={show_live}
							aria-controls="live-visitors"
							aria-label="Realtime visitors: {live_stats_query.current
								?.active_visitors ?? 0}. Toggle live pages"
							onclick={() => (show_live = !show_live)}
						>
							{number_crunch(
								live_stats_query.current?.active_visitors ?? 0,
							)}
						</button>
					</dd>
				</div>
				{@render summary_item(
					selected_filter_mode === 'bots'
						? 'Bot visitors'
						: 'Site visitors',
					number_crunch(period_stats.unique_visitors),
				)}
				{@render summary_item(
					selected_filter_mode === 'bots'
						? 'Bot pageviews'
						: 'Pageviews',
					number_crunch(period_stats.views),
				)}
				{@render summary_item('Views per visitor', views_per_visitor)}
				{@render summary_item(
					'Countries',
					period_stats.countries.length,
				)}
				{@render summary_item(
					'Pages with traffic',
					number_crunch(period_stats.top_pages.length),
				)}
			</dl>
		</div>
	{:else if period_loading}
		<div class="flex items-center justify-center py-8">
			<div class="loading loading-md loading-spinner"></div>
		</div>
	{/if}

	<div id="live-visitors" hidden={!show_live}>
		<LiveDashboard />
	</div>

	{#if period_stats}
		<!-- Period chart -->
		{#if chart_data_parsed.length > 0}
			{@const max_value = Math.max(
				...chart_data_parsed.map((d) =>
					Math.max(d.views, d.visitors),
				),
			)}
			{#key chart_data_parsed.length}
				<div class="rounded-box bg-base-200 p-4 sm:p-6">
					<div class="mb-2 flex items-center gap-4 text-xs">
						<span class="opacity-80">UTC</span>
						<span class="flex items-center gap-1">
							<span class="inline-block h-2 w-4 rounded bg-secondary"
							></span>
							Visitors
						</span>
						<span class="flex items-center gap-1">
							<span class="inline-block h-2 w-4 rounded bg-primary"
							></span>
							Views
						</span>
					</div>
					<div class="h-72">
						<Chart
							data={chart_data_parsed}
							x="date"
							xScale={scaleTime()}
							y="views"
							seriesLayout="overlap"
							series={[
								{
									key: 'visitors',
									color: 'var(--color-secondary)',
								},
								{
									key: 'views',
									color: 'var(--color-primary)',
								},
							]}
							yDomain={[0, max_value]}
							yNice
							padding={{ left: 8, bottom: 24, right: 40, top: 8 }}
							tooltipContext={{ mode: 'bisect-x' }}
						>
							<Svg>
								<Axis
									placement="right"
									grid={{
										class:
											'stroke-[var(--color-base-content)] opacity-20 [stroke-dasharray:2_4]',
									}}
									format={(v: number) => number_crunch(v)}
									classes={{
										tickLabel:
											'!stroke-transparent fill-[var(--color-base-content)] opacity-70',
									}}
								/>
								<Axis
									placement="bottom"
									rule
									ticks={7}
									format={(v: Date) =>
										selected_stats_period === 'today' ||
										selected_stats_period === 'yesterday'
											? v.toLocaleTimeString('en-GB', {
													hour: '2-digit',
													minute: '2-digit',
												})
											: v.toLocaleDateString('en-GB', {
													day: 'numeric',
													month: 'short',
												})}
									classes={{
										tickLabel:
											'!stroke-transparent fill-[var(--color-base-content)] opacity-70',
									}}
								/>
								<!-- Visitors area with gradient -->
								<LinearGradient
									class="from-secondary/30 to-secondary/1"
									vertical
								>
									{#snippet children({ gradient })}
										<Area
											seriesKey="visitors"
											curve={curveMonotoneX}
											fill={gradient}
											line={{
												class: 'stroke-secondary stroke-2',
											}}
										/>
									{/snippet}
								</LinearGradient>
								<!-- Views area with gradient -->
								<LinearGradient
									class="from-primary/30 to-primary/1"
									vertical
								>
									{#snippet children({ gradient })}
										<Area
											seriesKey="views"
											curve={curveMonotoneX}
											fill={gradient}
											line={{
												class: 'stroke-primary stroke-2',
											}}
										/>
									{/snippet}
								</LinearGradient>
								<Highlight points lines />
							</Svg>
							<Tooltip.Root
								variant="none"
								classes={{
									container:
										'bg-base-100 text-base-content rounded-lg border border-base-300 px-3 py-2 text-sm shadow-lg',
								}}
							>
								{#snippet children({
									data,
								}: {
									data: {
										timestamp: string;
									};
								})}
									{@const point = chart_data_parsed.find(
										(p) => p.timestamp === data.timestamp,
									)}
									<Tooltip.Header>
										<span
											class="text-xs font-medium text-base-content/70"
										>
											{#if point}
												{#if selected_stats_period === 'today' || selected_stats_period === 'yesterday'}
													{point.date.toLocaleTimeString('en-GB', {
														hour: '2-digit',
														minute: '2-digit',
													})}
													&middot;
													{point.date.toLocaleDateString('en-GB', {
														day: 'numeric',
														month: 'short',
													})}
												{:else}
													{point.date.toLocaleDateString('en-GB', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
													})}
												{/if}
											{:else}
												{data.timestamp}
											{/if}
										</span>
									</Tooltip.Header>
									<Tooltip.List>
										<Tooltip.Item
											label="Visitors"
											value={number_crunch(point?.visitors ?? 0)}
											classes={{
												label: 'text-secondary',
											}}
										/>
										<Tooltip.Item
											label="Views"
											value={number_crunch(point?.views ?? 0)}
											classes={{
												label: 'text-primary',
											}}
										/>
									</Tooltip.List>
								{/snippet}
							</Tooltip.Root>
						</Chart>
					</div>
				</div>
			{/key}
		{/if}

		{#snippet panel_header(title: string, first = 'Visitors')}
			<div class="mb-1 flex items-center gap-3 px-2 text-xs">
				<h2 class="flex-1 font-semibold">{title}</h2>
				<span class="w-14 text-right opacity-80">{first}</span>
				<span class="w-14 text-right opacity-80">Views</span>
			</div>
		{/snippet}

		<!-- Pages + Referrers -->
		<div
			class="grid gap-1.5 transition-opacity lg:grid-cols-2"
			class:opacity-60={period_loading}
		>
			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{@render panel_header('Pages')}
				{#if period_stats.top_pages.length > 0}
					{@const top_pages = period_stats.top_pages.slice(0, 10)}
					{@const max_visitors = Math.max(
						...top_pages.map((p) => p.visitors),
					)}
					<ul>
						{#each top_pages as page (page.path)}
							<StatRowMulti
								label={page.path}
								visitors={page.visitors}
								views={page.views}
								max_value={max_visitors}
								href={page.path}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 text-sm opacity-70">No data</p>
				{/if}
			</div>

			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{@render panel_header('Referrers')}
				{#if period_stats.referrers.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.referrers.map((r) => r.visitors),
					)}
					<ul>
						{#each period_stats.referrers as ref (ref.referrer)}
							<StatRowMulti
								label={parse_referrer(ref.referrer)}
								visitors={ref.visitors}
								views={ref.views}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 text-sm opacity-70">No referrer data</p>
				{/if}
			</div>
		</div>

		<!-- Countries + Browsers + Devices -->
		<div
			class="grid gap-1.5 transition-opacity lg:grid-cols-3"
			class:opacity-60={period_loading}
		>
			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{@render panel_header('Countries')}
				{#if period_stats.countries.length > 0}
					{@const countries = period_stats.countries.slice(0, 10)}
					{@const max_visitors = Math.max(
						...countries.map((c) => c.visitors),
					)}
					<ul>
						{#each countries as c (c.country)}
							<StatRowMulti
								label={c.country}
								prefix={country_flag(c.country)}
								label_class="uppercase"
								visitors={c.visitors}
								views={c.views}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 text-sm opacity-70">No data</p>
				{/if}
			</div>

			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{@render panel_header('Browsers')}
				{#if period_stats.browsers.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.browsers.map((b) => b.visitors),
					)}
					<ul>
						{#each period_stats.browsers as b (b.browser)}
							<StatRowMulti
								label={b.browser}
								label_class="capitalize"
								visitors={b.visitors}
								views={b.views}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 text-sm opacity-70">No data</p>
				{/if}
			</div>

			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{@render panel_header('Devices')}
				{#if period_stats.devices.length > 0}
					{@const max_visitors = Math.max(
						...period_stats.devices.map((d) => d.visitors),
					)}
					<ul>
						{#each period_stats.devices as d (d.device_type)}
							<StatRowMulti
								label={d.device_type}
								prefix={device_icon(d.device_type)}
								label_class="capitalize"
								visitors={d.visitors}
								views={d.views}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 text-sm opacity-70">No data</p>
				{/if}
			</div>
		</div>

		<!-- Engagement Stats -->
		{#if engagement_stats && sorted_engagement_pages.length > 0}
			{@const max_clicks = Math.max(
				...sorted_engagement_pages.map((p) => p.clicks),
			)}
			{@const max_rate = Math.max(
				...sorted_engagement_pages.map((p) => p.engagement_rate),
			)}
			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				<div
					class="mb-1 flex flex-wrap items-center gap-3 px-2 text-xs"
				>
					<h2 class="font-semibold">Page engagement</h2>
					<div class="join flex-1">
						<button
							class="btn join-item btn-xs {engagement_sort_mode ===
							'clicks'
								? 'btn-accent'
								: ''}"
							aria-pressed={engagement_sort_mode === 'clicks'}
							onclick={() => (engagement_sort_mode = 'clicks')}
						>
							Most clicks
						</button>
						<button
							class="btn join-item btn-xs {engagement_sort_mode ===
							'rate'
								? 'btn-accent'
								: ''}"
							aria-pressed={engagement_sort_mode === 'rate'}
							onclick={() => (engagement_sort_mode = 'rate')}
						>
							Highest rate
						</button>
					</div>
					<span class="w-14 text-right opacity-80">Clicks</span>
					<span class="w-14 text-right opacity-80">Views</span>
					<span class="w-14 text-right opacity-80">Rate</span>
				</div>
				<ul>
					{#each sorted_engagement_pages as page (page.path)}
						{@const bar_value =
							engagement_sort_mode === 'clicks'
								? page.clicks / max_clicks
								: page.engagement_rate / max_rate}
						<li
							class="relative flex h-9 items-center gap-3 px-2 text-sm"
						>
							<div
								class="absolute inset-y-0.5 left-0 rounded bg-current opacity-10"
								style="width: {bar_value * 100}%"
							></div>
							<a
								href={page.path}
								class="relative min-w-0 flex-1 truncate link-hover"
							>
								{page.path}
							</a>
							<span class="relative w-14 text-right tabular-nums">
								{number_crunch(page.clicks)}
							</span>
							<span
								class="relative w-14 text-right tabular-nums opacity-70"
							>
								{number_crunch(page.human_views)}
							</span>
							<span class="relative w-14 text-right tabular-nums">
								{page.engagement_rate >= 10
									? `${Math.round(page.engagement_rate)}%`
									: `${page.engagement_rate.toFixed(1)}%`}
							</span>
						</li>
					{/each}
				</ul>
				<p class="mt-2 px-2 text-xs opacity-70">
					Overall: {engagement_stats.total_clicks} clicks / {number_crunch(
						engagement_stats.total_human_views,
					)} views = {engagement_stats.overall_engagement_rate.toFixed(
						1,
					)}% engagement
				</p>
			</div>
		{/if}
	{/if}
</div>
