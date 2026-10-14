<script lang="ts">
	import { reactions as reaction_config } from '#lib/reactions-config.js';
	import { number_crunch } from '#lib/utils/index.js';
	import { curveMonotoneX } from 'd3-shape';
	import {
		Area,
		AreaChart,
		LinearGradient,
		LineChart,
	} from 'layerchart';

	interface Props {
		history?: PostMonthlyViews[];
		launch?: PostLaunch | null;
		reactions?: PostReactionsSummary | null;
	}

	let {
		history = [],
		launch = null,
		reactions = null,
	}: Props = $props();

	/** Daily tracking replaced the old monthly aggregates from Jan 2026 */
	const TRACKING_CHANGE = new Date('2026-01-01T00:00:00Z');

	const fmt = (n: number) => Math.round(n).toLocaleString('en-GB');
	// Axis styling matches the period chart on /stats: values on the
	// right over a dashed grid, muted tick labels
	const tick_label =
		'!stroke-transparent fill-[var(--color-base-content)] opacity-70';
	const y_axis = {
		placement: 'right' as const,
		grid: {
			class:
				'stroke-[var(--color-base-content)] opacity-20 [stroke-dasharray:2_4]',
		},
		format: (v: number) => number_crunch(v),
		classes: { tickLabel: tick_label },
	};
	const chart_padding = { left: 8, bottom: 24, top: 8, right: 40 };
	const month_name = (d: Date) =>
		d.toLocaleDateString('en-GB', {
			month: 'short',
			timeZone: 'UTC',
		});
	const month_tick = (d: Date) =>
		`${month_name(d)} '${String(d.getUTCFullYear()).slice(2)}`;
	const month_full = (d: Date) =>
		`${month_name(d)} ${d.getUTCFullYear()}`;
	const ordinal_suffixes: Partial<
		Record<Intl.LDMLPluralRule, string>
	> = { one: 'st', two: 'nd', few: 'rd' };
	const ordinal_rules = new Intl.PluralRules('en-GB', {
		type: 'ordinal',
	});
	const ordinal = (n: number) =>
		`${n}${ordinal_suffixes[ordinal_rules.select(n)] ?? 'th'}`;

	// The current month is partial (and shown in the cards above), so
	// leave it out rather than draw a drop-off that isn't real
	const current_month = new Date().toISOString().slice(0, 7);
	const monthly_data = $derived(
		history
			.filter((h) => h.views > 0 && h.month < current_month)
			.map((h) => ({
				date: new Date(`${h.month}-01T00:00:00Z`),
				views: h.views,
			})),
	);
	/** One tick per month, thinned to at most six */
	const month_ticks = $derived.by(() => {
		const step = Math.ceil(monthly_data.length / 6);
		return monthly_data
			.filter((_, i) => i % step === 0)
			.map((d) => d.date);
	});
	/** Two points only draw a straight line, so wait for a third month */
	const show_monthly = $derived(monthly_data.length >= 3);
	const spans_tracking_change = $derived(
		monthly_data.length > 1 &&
			monthly_data[0].date < TRACKING_CHANGE &&
			monthly_data[monthly_data.length - 1].date >= TRACKING_CHANGE,
	);

	const launch_data = $derived(
		launch
			? launch.cumulative.map((views, i) => ({
					day: i + 1,
					views,
					median: launch.median[i],
				}))
			: [],
	);
	const launch_views = $derived(
		launch ? (launch.cumulative[launch.day] ?? 0) : 0,
	);
	const launch_median = $derived(
		launch ? launch.median[launch.day] : null,
	);
	const has_median = $derived(
		launch?.median.some((v) => v != null) ?? false,
	);
	const reactions_rate = $derived.by(() => {
		if (reactions?.per_1k_views == null) return '';
		const site =
			reactions.site_per_1k_views != null
				? ` (site average ${reactions.site_per_1k_views.toFixed(1)})`
				: '';
		return `${reactions.per_1k_views.toFixed(1)} reactions per 1,000 views${site}.`;
	});
	const launch_summary = $derived.by(() => {
		if (!launch) return '';
		const days =
			launch.days_live < launch.cumulative.length
				? `${launch.days_live} ${launch.days_live === 1 ? 'day' : 'days'} so far`
				: `first ${launch.cumulative.length} days`;
		const median =
			launch_median != null
				? `, where the median is ${fmt(launch_median)}`
				: '';
		return `${fmt(launch_views)} views in its ${days}. That's ${ordinal(launch.rank)} of ${launch.cohort_size} posts launched in the last year${median}.`;
	});
</script>

{#if show_monthly || launch || reactions}
	<section class="px-6" aria-labelledby="post-trends-heading">
		<h3 id="post-trends-heading" class="sr-only">Trends</h3>

		{#if launch}
			<article class="mb-8">
				<header class="mb-2 pl-1">
					<h4 class="text-lg font-semibold">Launch</h4>
					<p class="text-sm text-base-content/80">{launch_summary}</p>
				</header>
				<div class="h-52" data-testid="launch-chart">
					<LineChart
						data={launch_data}
						x="day"
						xDomain={[1, launch.cumulative.length]}
						series={[
							{
								key: 'views',
								label: 'This post',
								color: 'var(--color-primary)',
							},
							...(has_median
								? [
										{
											key: 'median',
											label: 'Median new post',
											color: 'var(--color-secondary)',
										},
									]
								: []),
						]}
						legend
						grid={false}
						padding={{ ...chart_padding, bottom: 48 }}
						props={{
							xAxis: {
								format: (d: number) => `Day ${d}`,
								ticks: 5,
								classes: { tickLabel: tick_label },
							},
							yAxis: y_axis,
							spline: { curve: curveMonotoneX, class: 'stroke-2' },
							tooltip: {
								// The modal <dialog> sits in the top layer, so a
								// tooltip portalled to <body> would render under it
								root: { portal: false },
								hideTotal: true,
								header: { format: (d: number) => `Day ${d}` },
								item: { format: (v: number) => fmt(v) },
							},
						}}
					/>
				</div>
				<p class="mt-1 pl-1 text-xs text-base-content/60">
					Cumulative views, counted from the first day the post had
					views.
				</p>
			</article>
		{/if}

		{#if show_monthly}
			<article class="mb-8">
				<header class="mb-2 pl-1">
					<h4 class="text-lg font-semibold">Views by month</h4>
				</header>
				<div class="h-52" data-testid="monthly-chart">
					<AreaChart
						data={monthly_data}
						x="date"
						y="views"
						series={[
							{
								key: 'views',
								label: 'Views',
								color: 'var(--color-primary)',
							},
						]}
						grid={false}
						padding={chart_padding}
						annotations={spans_tracking_change
							? [
									{
										type: 'line',
										x: TRACKING_CHANGE,
										label: 'New tracking',
										labelXOffset: 4,
										labelYOffset: 4,
										props: {
											line: {
												class: 'stroke-base-content/40',
												dashArray: [2, 2],
											},
											label: {
												class: 'fill-base-content/60 text-xs',
											},
										},
									},
								]
							: []}
						props={{
							xAxis: {
								format: month_tick,
								ticks: month_ticks,
								classes: { tickLabel: tick_label },
							},
							yAxis: y_axis,
							tooltip: {
								// The modal <dialog> sits in the top layer, so a
								// tooltip portalled to <body> would render under it
								root: { portal: false },
								hideTotal: true,
								header: {
									format: month_full,
								},
								item: { format: (v: number) => fmt(v) },
							},
						}}
					>
						{#snippet marks()}
							<LinearGradient
								class="from-primary/30 to-primary/1"
								vertical
							>
								{#snippet children({ gradient })}
									<Area
										seriesKey="views"
										curve={curveMonotoneX}
										fill={gradient}
										line={{ class: 'stroke-primary stroke-2' }}
									/>
								{/snippet}
							</LinearGradient>
						{/snippet}
					</AreaChart>
				</div>
				{#if spans_tracking_change}
					<p class="mt-1 pl-1 text-xs text-base-content/60">
						Tracking changed in January 2026, so earlier months aren't
						directly comparable.
					</p>
				{/if}
			</article>
		{/if}

		{#if reactions}
			<article class="mb-8">
				<header class="mb-2 pl-1">
					<h4 class="text-lg font-semibold">Reactions</h4>
				</header>
				<p class="pl-1">
					{#each reaction_config as { type, emoji } (type)}
						<span class="mr-3 tabular-nums">
							<span aria-hidden="true">{emoji}</span>
							<span class="sr-only">{type}</span>
							{fmt(reactions.by_type[type] ?? 0)}
						</span>
					{/each}
				</p>
				{#if reactions_rate}
					<p class="mt-1 pl-1 text-sm text-base-content/80">
						{reactions_rate}
					</p>
				{/if}
			</article>
		{/if}
	</section>
{/if}
