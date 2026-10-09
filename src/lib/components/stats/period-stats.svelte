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
		format_duration,
		get_delta,
	} from '#lib/analytics/period-stats.helpers.js';
	import {
		get_period_stats,
		type FilterMode,
		type PeriodCounts,
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
	import { onMount } from 'svelte';
	import BreakdownTowers from './breakdown-towers.svelte';
	import ChartViewControls from './chart-view-controls.svelte';
	import LiveDashboard from './live-dashboard.svelte';
	import PeriodChart3d, {
		type ChartSeries,
	} from './period-chart-3d.svelte';
	import { get_referrer_icon } from './referrer-icons.js';
	import StatRowMulti from './stat-row-multi.svelte';
	import {
		country_flag,
		device_icon,
		parse_referrer,
		period_labels,
	} from './stats.svelte';

	let selected_stats_period = $state<StatsPeriod>('today');
	let selected_filter_mode = $state<FilterMode>('humans');

	// Derived from the selection: the previous data stays on screen
	// (dimmed) until the queries for a new period or filter resolve
	const [period_stats, chart_data, engagement_stats]: [
		PeriodStats | null,
		ChartData | null,
		EngagementStats | null,
	] = $derived(
		await Promise.all([
			get_period_stats({
				period: selected_stats_period,
				filter_mode: selected_filter_mode,
			}),
			get_chart_data({
				period: selected_stats_period,
				filter_mode: selected_filter_mode,
			}),
			get_engagement_stats({ period: selected_stats_period }),
		]),
	);
	const period_loading = $derived($effect.pending() > 0);
	let engagement_sort_mode = $state<EngagementSortMode>('clicks');

	let show_live = $state(true);

	// Everything is flat until asked: 3D stands the period chart up
	// and swaps the breakdown lists for towers
	let view_3d = $state(false);
	// The 3D charts stay mounted while the period chart lays itself
	// flat again: swapping the panels back mid-tween stalls the page
	let show_chart_3d = $state(false);
	let chart_3d_ref = $state<PeriodChart3d>();

	// In 3D the chart's depth compares humans with bots, whatever the
	// filter, so one metric is shown at a time
	let metric_3d = $state<'views' | 'visitors'>('views');
	// The metric keeps the colour it has in the flat chart. People take
	// it at full strength and bots a greyed step of it, so the pair
	// reads as one measure split by audience
	const metric_hue = $derived(
		metric_3d === 'views'
			? 'var(--color-primary)'
			: 'var(--color-secondary)',
	);
	const audiences = $derived([
		// Bots stand at the back, people in front
		{
			key: 'bots' as const,
			label: 'Bots',
			colour: `color-mix(in oklab, ${metric_hue} 35%, var(--color-base-content))`,
		},
		{ key: 'humans' as const, label: 'Humans', colour: metric_hue },
	]);
	// Read through `current` rather than awaited: only wanted in 3D,
	// and awaiting would hold the whole page back for them
	const audience_queries = $derived(
		show_chart_3d
			? audiences.map((audience) => ({
					...audience,
					query: get_chart_data({
						period: selected_stats_period,
						filter_mode: audience.key,
					}),
				}))
			: [],
	);
	const audience_series = $derived.by((): ChartSeries[] => {
		const series = audience_queries.map(({ query, ...audience }) => ({
			...audience,
			points: (query.current?.data_points ?? []).map((point) => ({
				date: new Date(point.timestamp),
				value: point[metric_3d],
			})),
		}));
		// Drawn once both have loaded, so neither stands alone
		return series.every((item) => item.points.length > 0)
			? series
			: [];
	});

	// The chart only renders in the browser: layerchart draws nothing
	// on the server and fails to hydrate into the empty container
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	// Shared with LiveDashboard, which handles the refresh interval
	const live_stats_query = get_live_stats_breakdown();

	const previous = $derived(period_stats?.previous ?? null);

	// Counts for the same row last period; a missing row means zero
	const previous_for = (
		lookup: Record<string, PeriodCounts> | null | undefined,
		key: string,
	): PeriodCounts | null =>
		lookup ? (lookup[key] ?? { views: 0, visitors: 0 }) : null;

	const format_delta = (delta: number) =>
		`${delta > 0 ? '+' : delta < 0 ? '−' : ''}${number_crunch(Math.abs(delta))}`;

	type SummaryDelta = { text: string; good: boolean } | null;

	const count_delta = (
		current: number,
		before: number | null | undefined,
	): SummaryDelta => {
		const delta = get_delta(current, before);
		return delta
			? { text: format_delta(delta), good: delta > 0 }
			: null;
	};

	// Bounce rate, time on site and entry/exit pages (today and yesterday)
	const visits = $derived(period_stats?.visits ?? null);

	const duration_delta = $derived.by((): SummaryDelta => {
		const delta = get_delta(
			visits?.avg_duration_ms ?? 0,
			previous?.visits?.avg_duration_ms,
		);
		if (!visits || delta === null || Math.abs(delta) < 1000)
			return null;
		return {
			text: `${delta > 0 ? '+' : '−'}${format_duration(delta)}`,
			good: delta > 0,
		};
	});

	// A lower bounce rate is the good direction
	const bounce_delta = $derived.by((): SummaryDelta => {
		const delta = get_delta(
			visits?.bounce_rate ?? 0,
			previous?.visits?.bounce_rate,
		);
		if (!visits || delta === null || Math.round(delta) === 0)
			return null;
		return {
			text: `${delta > 0 ? '+' : '−'}${Math.abs(Math.round(delta))}%`,
			good: delta < 0,
		};
	});

	type PagesTab = 'pages' | 'entry' | 'exit';
	const pages_tabs: { id: PagesTab; label: string; count: string }[] =
		[
			{ id: 'pages', label: 'Pages', count: 'Views' },
			{ id: 'entry', label: 'Entry pages', count: 'Entries' },
			{ id: 'exit', label: 'Exit pages', count: 'Exits' },
		];
	let selected_pages_tab = $state<PagesTab>('pages');
	// Entry and exit pages only exist where there is visit data
	const pages_tab = $derived(
		pages_tabs.find(
			(tab) => visits && tab.id === selected_pages_tab,
		) ?? pages_tabs[0],
	);
	const page_rows = $derived(
		pages_tab.id === 'entry'
			? (visits?.entry_pages ?? [])
			: pages_tab.id === 'exit'
				? (visits?.exit_pages ?? [])
				: (period_stats?.top_pages.slice(0, 10) ?? []),
	);

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

		<button
			class="btn btn-sm {view_3d ? 'btn-primary' : ''}"
			aria-pressed={view_3d}
			onclick={() => {
				view_3d = !view_3d;
				if (view_3d) show_chart_3d = true;
			}}
		>
			3D
		</button>
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
				{#snippet summary_item(
					label: string,
					value: string | number,
					delta: SummaryDelta = null,
				)}
					<div class="flex flex-col-reverse">
						<dt class="text-sm">
							<span class="opacity-80">{label}</span>
							{#if delta}
								<span
									class="ml-1 text-xs tabular-nums {delta.good
										? 'text-success'
										: 'text-error'}"
								>
									{delta.text}
								</span>
							{/if}
						</dt>
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
					count_delta(
						period_stats.unique_visitors,
						previous?.unique_visitors,
					),
				)}
				{@render summary_item(
					selected_filter_mode === 'bots'
						? 'Bot pageviews'
						: 'Pageviews',
					number_crunch(period_stats.views),
					count_delta(period_stats.views, previous?.views),
				)}
				{#if visits}
					{@render summary_item(
						'Avg time on site',
						format_duration(visits.avg_duration_ms),
						duration_delta,
					)}
					{@render summary_item(
						'Bounce rate',
						`${Math.round(visits.bounce_rate)}%`,
						bounce_delta,
					)}
					{@render summary_item(
						'Views per visitor',
						views_per_visitor,
					)}
				{:else}
					{@render summary_item(
						'Views per visitor',
						views_per_visitor,
					)}
					{@render summary_item(
						'Countries',
						period_stats.countries.length,
					)}
					{@render summary_item(
						'Pages with traffic',
						number_crunch(period_stats.top_pages.length),
					)}
				{/if}
			</dl>
			{#if previous}
				<p class="mt-4 text-xs opacity-70">
					Changes are compared with {previous.label}.
				</p>
			{/if}
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
						{#if show_chart_3d}
							{#each [...audiences].reverse() as audience (audience.key)}
								<span class="flex items-center gap-1">
									<span
										class="inline-block h-2 w-4 rounded"
										style="background: {audience.colour}"
									></span>
									{audience.label}
								</span>
							{/each}
							<div
								class="join"
								role="group"
								aria-label="Chart metric"
							>
								{#each ['views', 'visitors'] as const as metric (metric)}
									<button
										class="btn join-item capitalize btn-xs {metric_3d !==
										metric
											? ''
											: metric === 'views'
												? 'btn-primary'
												: 'btn-secondary'}"
										aria-pressed={metric_3d === metric}
										onclick={() => (metric_3d = metric)}
									>
										{metric}
									</button>
								{/each}
							</div>
						{:else}
							<span class="flex items-center gap-1">
								<span
									class="inline-block h-2 w-4 rounded bg-secondary"
								></span>
								Visitors
							</span>
							<span class="flex items-center gap-1">
								<span class="inline-block h-2 w-4 rounded bg-primary"
								></span>
								Views
							</span>
						{/if}
						{#if view_3d}
							<span class="hidden opacity-70 sm:inline">
								Drag to turn
							</span>
							<div class="ml-auto">
								<ChartViewControls
									label="period chart"
									on_turn={(degrees) => chart_3d_ref?.turn(degrees)}
									on_reset={() => chart_3d_ref?.reset()}
								/>
							</div>
						{/if}
					</div>
					{#if show_chart_3d && mounted}
						<PeriodChart3d
							bind:this={chart_3d_ref}
							series={audience_series}
							hourly={selected_stats_period === 'today' ||
								selected_stats_period === 'yesterday'}
							raised={view_3d}
							on_flat={() => (show_chart_3d = false)}
						/>
					{:else}
						<div class="h-72">
							{#if mounted}
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
															{point.date.toLocaleTimeString(
																'en-GB',
																{
																	hour: '2-digit',
																	minute: '2-digit',
																},
															)}
															&middot;
															{point.date.toLocaleDateString(
																'en-GB',
																{
																	day: 'numeric',
																	month: 'short',
																},
															)}
														{:else}
															{point.date.toLocaleDateString(
																'en-GB',
																{
																	day: 'numeric',
																	month: 'short',
																	year: 'numeric',
																},
															)}
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
							{/if}
						</div>
					{/if}
				</div>
			{/key}
		{/if}

		{#snippet panel_header(title: string, first = 'Visitors')}
			<div class="mb-1 flex items-center gap-3 px-2 text-xs">
				<h2 class="flex-1 font-semibold">{title}</h2>
				<span class="w-14 text-right opacity-80 sm:w-20">{first}</span
				>
				<span class="w-14 text-right opacity-80 sm:w-20">Views</span>
			</div>
		{/snippet}

		<!-- Pages + Referrers -->
		<div
			class="grid gap-1.5 transition-opacity lg:grid-cols-2"
			class:opacity-60={period_loading}
		>
			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{#if visits}
					<div class="mb-1 flex items-center gap-3 px-2 text-xs">
						<h2 class="sr-only">Pages</h2>
						<div
							class="flex flex-1 flex-wrap gap-x-3"
							role="group"
							aria-label="Page list"
						>
							{#each pages_tabs as tab (tab.id)}
								<button
									class="cursor-pointer rounded {pages_tab.id ===
									tab.id
										? 'font-semibold underline underline-offset-4'
										: 'link-hover opacity-80'}"
									aria-pressed={pages_tab.id === tab.id}
									onclick={() => (selected_pages_tab = tab.id)}
								>
									{tab.label}
								</button>
							{/each}
						</div>
						<span class="w-14 text-right opacity-80 sm:w-20">
							Visitors
						</span>
						<span class="w-14 text-right opacity-80 sm:w-20">
							{pages_tab.count}
						</span>
					</div>
				{:else}
					{@render panel_header('Pages')}
				{/if}
				{#if page_rows.length > 0}
					{@const max_visitors = Math.max(
						...page_rows.map((p) => p.visitors),
					)}
					<ul>
						{#each page_rows as page (page.path)}
							<StatRowMulti
								label={page.path}
								previous={pages_tab.id === 'pages'
									? previous_for(previous?.pages, page.path)
									: null}
								{format_delta}
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
								icon={get_referrer_icon(ref.referrer)}
								previous={previous_for(
									previous?.referrers,
									ref.referrer,
								)}
								{format_delta}
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
				{#if show_chart_3d && mounted && period_stats.countries.length > 0}
					<BreakdownTowers
						title="Countries"
						rows={period_stats.countries.slice(0, 8).map((c) => ({
							label: c.country.toUpperCase(),
							visitors: c.visitors,
							views: c.views,
						}))}
					/>
				{:else}
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
									previous={previous_for(
										previous?.countries,
										c.country,
									)}
									{format_delta}
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
				{/if}
			</div>

			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{#if show_chart_3d && mounted && period_stats.browsers.length > 0}
					<BreakdownTowers
						title="Browsers"
						rows={period_stats.browsers.slice(0, 6).map((b) => ({
							label: b.browser,
							visitors: b.visitors,
							views: b.views,
						}))}
					/>
				{:else}
					{@render panel_header('Browsers')}
					{#if period_stats.browsers.length > 0}
						{@const max_visitors = Math.max(
							...period_stats.browsers.map((b) => b.visitors),
						)}
						<ul>
							{#each period_stats.browsers as b (b.browser)}
								<StatRowMulti
									label={b.browser}
									previous={previous_for(
										previous?.browsers,
										b.browser,
									)}
									{format_delta}
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
				{/if}
			</div>

			<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
				{#if show_chart_3d && mounted && period_stats.devices.length > 0}
					<BreakdownTowers
						title="Devices"
						rows={period_stats.devices.map((d) => ({
							label: d.device_type,
							visitors: d.visitors,
							views: d.views,
						}))}
					/>
				{:else}
					{@render panel_header('Devices')}
					{#if period_stats.devices.length > 0}
						{@const max_visitors = Math.max(
							...period_stats.devices.map((d) => d.visitors),
						)}
						<ul>
							{#each period_stats.devices as d (d.device_type)}
								<StatRowMulti
									label={d.device_type}
									previous={previous_for(
										previous?.devices,
										d.device_type,
									)}
									{format_delta}
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
