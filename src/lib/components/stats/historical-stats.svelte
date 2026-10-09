<script lang="ts">
	import type { PeriodCounts } from '#lib/analytics/period-stats.helpers.js';
	import { number_crunch } from '#lib/utils/index.js';
	import { onMount, settled } from 'svelte';
	import PostRidges, { type Ridge } from './post-ridges.svelte';
	import HistoricalSkyline from './historical-skyline.svelte';
	import StatRowMulti from './stat-row-multi.svelte';
	import {
		month_labels,
		type HistoricalMetric,
		type MonthCell,
		type SiteStat,
	} from './stats.svelte';

	interface Props {
		site_stats: SiteStat[];
		current_month: string;
		current_year: string;
	}

	let { site_stats, current_year }: Props = $props();

	type Selection = { year: string | null; month: number | null };

	const top_posts_count = 10;
	const all_posts_count = 50;
	const ridge_count = 5;

	let metric = $state<HistoricalMetric>('views');
	// No year is every year; a month only narrows a selected year
	let selected_year = $state<string | null>(null);
	let selected_month = $state<number | null>(null);
	let show_all_posts = $state(false);
	// The post under the pointer or focus in the list, picked out in
	// the ridges beside it
	let highlighted_post = $state<string | null>(null);

	const highlight_row = (event: Event) => {
		const row = (event.target as Element).closest('li');
		const index = row
			? [...(row.parentElement?.children ?? [])].indexOf(row)
			: -1;
		highlighted_post = listed_posts[index]?.slug ?? null;
	};

	// The charts only render in the browser: layerchart draws nothing
	// on the server and fails to hydrate into the empty container.
	// They also wait for the period stats above to settle: mounted
	// during a pending async batch, the chart's derived state is
	// recomputed on every read and the depth sort locks the page up
	let mounted = $state(false);
	onMount(async () => {
		await settled();
		mounted = true;
	});

	const selection = $derived<Selection>({
		year: selected_year,
		month: selected_month,
	});

	const split_month = (year_month: string) => {
		const [year, month] = year_month.split('-');
		return { year, month: Number(month) };
	};

	// The current year is covered by the period stats above
	const is_historical = (year: string) =>
		Number(year) < Number(current_year);

	const matches = (
		{ year, month }: { year: string; month: number },
		filter: Selection,
	) =>
		is_historical(year) &&
		(!filter.year || year === filter.year) &&
		(!filter.month || month === filter.month);

	// Every post's months summed into one cell per calendar month
	const cells = $derived.by(() => {
		const totals = new Map<string, MonthCell>();
		for (const post of site_stats) {
			for (const stat of post.monthly_stats) {
				const { year, month } = split_month(stat.year_month);
				if (!is_historical(year)) continue;
				const cell = totals.get(stat.year_month) ?? {
					year,
					month,
					views: 0,
					visitors: 0,
				};
				cell.views += stat.views;
				cell.visitors += stat.unique_visitors;
				totals.set(stat.year_month, cell);
			}
		}
		return [...totals.values()].sort(
			(a, b) => a.year.localeCompare(b.year) || a.month - b.month,
		);
	});

	const years = $derived(
		[...new Set(cells.map((cell) => cell.year))].sort(),
	);

	const months_in_year = $derived(
		cells
			.filter((cell) => cell.year === selected_year)
			.map((cell) => cell.month),
	);

	// The period the deltas compare against: the year or month before
	const previous_selection = $derived.by((): Selection | null => {
		if (!selected_year) return null;
		const before = selected_month
			? selected_month === 1
				? { year: `${Number(selected_year) - 1}`, month: 12 }
				: { year: selected_year, month: selected_month - 1 }
			: { year: `${Number(selected_year) - 1}`, month: null };
		return cells.some((cell) => matches(cell, before))
			? before
			: null;
	});

	const totals_for = (filter: Selection) => {
		const in_period = cells.filter((cell) => matches(cell, filter));
		return {
			views: in_period.reduce((sum, cell) => sum + cell.views, 0),
			visitors: in_period.reduce(
				(sum, cell) => sum + cell.visitors,
				0,
			),
			best: in_period.reduce<MonthCell | null>(
				(best, cell) =>
					!best || cell[metric] > best[metric] ? cell : best,
				null,
			),
		};
	};

	const posts_for = (filter: Selection) =>
		site_stats
			.map((post) => {
				const counts = { views: 0, visitors: 0 };
				for (const stat of post.monthly_stats) {
					if (!matches(split_month(stat.year_month), filter))
						continue;
					counts.views += stat.views;
					counts.visitors += stat.unique_visitors;
				}
				return { slug: post.slug, title: post.title, ...counts };
			})
			.filter((post) => post.views > 0);

	const totals = $derived(totals_for(selection));
	const previous_totals = $derived(
		previous_selection ? totals_for(previous_selection) : null,
	);

	const ranked_posts = $derived(
		posts_for(selection).sort((a, b) => b[metric] - a[metric]),
	);
	const previous_posts = $derived.by(
		(): Record<string, PeriodCounts> | null =>
			previous_selection
				? Object.fromEntries(
						posts_for(previous_selection).map((post) => [
							post.slug,
							{ views: post.views, visitors: post.visitors },
						]),
					)
				: null,
	);
	const listed_posts = $derived(
		ranked_posts.slice(
			0,
			show_all_posts ? all_posts_count : top_posts_count,
		),
	);

	const format_period = ({ year, month }: Selection) =>
		year
			? month
				? `${month_labels[month - 1]} ${year}`
				: year
			: `${years[0]}–${years[years.length - 1]}`;
	const period_label = $derived(format_period(selection));

	const format_delta = (delta: number) =>
		`${delta > 0 ? '+' : delta < 0 ? '−' : ''}${number_crunch(Math.abs(delta))}`;

	const count_delta = (
		current: number,
		before: number | undefined,
	) =>
		before === undefined || current === before
			? null
			: {
					text: format_delta(current - before),
					good: current > before,
				};

	const views_per_visitor = $derived(
		totals.visitors > 0
			? (totals.views / totals.visitors).toFixed(1)
			: '0',
	);

	// The top posts month by month: the selected year, or every year
	const ridges = $derived.by((): Ridge[] => {
		const timeline = cells.filter(
			(cell) => !selected_year || cell.year === selected_year,
		);
		return ranked_posts.slice(0, ridge_count).map((post) => {
			const by_month = new Map(
				site_stats
					.find((stat) => stat.slug === post.slug)
					?.monthly_stats.map((stat) => [stat.year_month, stat]),
			);
			return {
				slug: post.slug,
				title: post.title,
				points: timeline.map((cell, index) => {
					const stat = by_month.get(
						`${cell.year}-${`${cell.month}`.padStart(2, '0')}`,
					);
					return {
						index,
						label: selected_year
							? month_labels[cell.month - 1]
							: `${month_labels[cell.month - 1]} ${cell.year.slice(2)}`,
						value:
							(metric === 'views'
								? stat?.views
								: stat?.unique_visitors) ?? 0,
					};
				}),
			};
		});
	});

	const select_year = (year: string | null) => {
		selected_year = year;
		selected_month = null;
	};

	// Selecting the selected tower again steps back out to its year
	const select_tower = (year: string, month: number) => {
		const is_selected =
			selected_year === year && selected_month === month;
		selected_year = year;
		selected_month = is_selected ? null : month;
	};

	const cell_for = (year: string, month: number) =>
		cells.find((cell) => cell.year === year && cell.month === month);
</script>

{#if cells.length > 0}
	<section aria-labelledby="historical-heading" class="mb-12">
		<div
			class="mb-4 flex flex-wrap items-end justify-between gap-4 border-t border-base-300 pt-8"
		>
			<div>
				<h2 id="historical-heading" class="text-3xl font-bold">
					Historical
				</h2>
				<p class="text-sm opacity-80">
					Post traffic by month, {years[0]} to {years[
						years.length - 1
					]}. This year is in the stats above.
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<!-- Year selector -->
				<div class="join" role="group" aria-label="Year">
					<button
						class="btn join-item btn-sm {selected_year === null
							? 'btn-primary'
							: ''}"
						aria-pressed={selected_year === null}
						onclick={() => select_year(null)}
					>
						All years
					</button>
					{#each years as year (year)}
						<button
							class="btn join-item btn-sm {selected_year === year
								? 'btn-primary'
								: ''}"
							aria-pressed={selected_year === year}
							onclick={() => select_year(year)}
						>
							{year}
						</button>
					{/each}
				</div>

				<select
					class="select w-auto select-sm"
					aria-label="Month"
					disabled={!selected_year}
					bind:value={selected_month}
				>
					<option value={null}>All months</option>
					{#each months_in_year as month (month)}
						<option value={month}>{month_labels[month - 1]}</option>
					{/each}
				</select>

				<!-- Metric toggle -->
				<div class="join" role="group" aria-label="Metric">
					<button
						class="btn join-item btn-sm {metric === 'views'
							? 'btn-primary'
							: ''}"
						aria-pressed={metric === 'views'}
						onclick={() => (metric = 'views')}
					>
						Views
					</button>
					<button
						class="btn join-item btn-sm {metric === 'visitors'
							? 'btn-secondary'
							: ''}"
						aria-pressed={metric === 'visitors'}
						onclick={() => (metric = 'visitors')}
					>
						Visitors
					</button>
				</div>
			</div>
		</div>

		<div class="space-y-1.5">
			<!-- Summary strip -->
			<div class="rounded-box bg-base-200 p-4 sm:p-6">
				<dl
					class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5"
				>
					{#snippet summary_item(
						label: string,
						value: string | number,
						delta: { text: string; good: boolean } | null = null,
						wide = false,
					)}
						<div
							class="flex flex-col-reverse {wide
								? 'col-span-2 sm:col-span-1'
								: ''}"
						>
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
								class="text-5xl font-light tracking-tight whitespace-nowrap"
							>
								{value}
							</dd>
						</div>
					{/snippet}
					{@render summary_item(
						'Pageviews',
						number_crunch(totals.views),
						count_delta(totals.views, previous_totals?.views),
					)}
					{@render summary_item(
						'Visitors',
						number_crunch(totals.visitors),
						count_delta(totals.visitors, previous_totals?.visitors),
					)}
					{@render summary_item(
						'Views per visitor',
						views_per_visitor,
					)}
					{@render summary_item(
						'Posts read',
						number_crunch(ranked_posts.length),
					)}
					{#if selected_month === null && totals.best}
						{@render summary_item(
							'Best month',
							format_period(totals.best),
							null,
							true,
						)}
					{:else if ranked_posts.length > 0}
						{@render summary_item(
							'Top post share',
							`${Math.round((ranked_posts[0][metric] / (totals[metric] || 1)) * 100)}%`,
						)}
					{/if}
				</dl>
				<p class="mt-4 text-xs opacity-70">
					Showing {period_label}{#if previous_selection}, compared
						with {format_period(previous_selection)}{/if}. Visitors
					are counted per post per month.
				</p>
			</div>

			<!-- Skyline: every month as a tower -->
			<div class="rounded-box bg-base-200 p-4 sm:p-6">
				<h3 class="sr-only">
					{metric === 'views' ? 'Views' : 'Visitors'} by month and year
				</h3>
				{#if mounted}
					<HistoricalSkyline
						{cells}
						{years}
						{metric}
						{selected_year}
						{selected_month}
						on_select={select_tower}
					/>
				{:else}
					<div class="h-64 sm:h-120"></div>
				{/if}

				<details class="mt-2 text-sm">
					<summary class="cursor-pointer text-xs opacity-80">
						View as table
					</summary>
					<div class="mt-2 overflow-x-auto">
						<table class="table table-xs">
							<caption class="sr-only">
								{metric === 'views' ? 'Views' : 'Visitors'} by month and
								year
							</caption>
							<thead>
								<tr>
									<th scope="col">Year</th>
									{#each month_labels as label (label)}
										<th scope="col" class="text-right">{label}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each years as year (year)}
									<tr>
										<th scope="row">{year}</th>
										{#each month_labels as label, index (label)}
											{@const cell = cell_for(year, index + 1)}
											<td class="text-right tabular-nums">
												{cell ? number_crunch(cell[metric]) : '–'}
											</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</details>
			</div>

			<!-- Top posts + how they moved -->
			<div class="grid gap-1.5 lg:grid-cols-[2fr_3fr]">
				<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
					<div class="mb-1 flex items-center gap-3 px-2 text-xs">
						<h3 class="flex-1 font-semibold">
							Top posts · {period_label}
						</h3>
						<span class="w-14 text-right opacity-80 sm:w-20">
							Visitors
						</span>
						<span class="w-14 text-right opacity-80 sm:w-20">
							Views
						</span>
					</div>
					{#if listed_posts.length > 0}
						{@const max_value = Math.max(
							...listed_posts.map((post) => post[metric]),
						)}
						<ol
							onpointerover={highlight_row}
							onpointerleave={() => (highlighted_post = null)}
							onfocusin={highlight_row}
							onfocusout={() => (highlighted_post = null)}
						>
							{#each listed_posts as post, index (post.slug)}
								<StatRowMulti
									label={post.title}
									prefix={`${index + 1}`}
									previous={previous_posts
										? (previous_posts[post.slug] ?? {
												views: 0,
												visitors: 0,
											})
										: null}
									{format_delta}
									visitors={post.visitors}
									views={post.views}
									{max_value}
									bar={metric}
									href="/posts/{post.slug}"
								/>
							{/each}
						</ol>
						{#if ranked_posts.length > top_posts_count}
							<button
								class="btn mt-2 btn-ghost btn-xs"
								aria-expanded={show_all_posts}
								onclick={() => (show_all_posts = !show_all_posts)}
							>
								{show_all_posts
									? 'Show fewer'
									: `Show top ${Math.min(all_posts_count, ranked_posts.length)}`}
							</button>
						{/if}
					{:else}
						<p class="px-2 text-sm opacity-70">No data</p>
					{/if}
				</div>

				<div class="min-w-0 rounded-box bg-base-200 p-4 sm:p-6">
					<div class="mb-1 px-2 text-xs">
						<h3 class="font-semibold">
							Top {Math.min(ridge_count, ridges.length)} posts, month by
							month
						</h3>
						<p class="opacity-80">
							One ridge per post from the list, the top post at the
							back.
						</p>
					</div>
					{#if mounted && ridges.length > 0 && ridges[0].points.length > 1}
						<PostRidges
							hint="Drag to turn · hover a ridge or a post in the list"
							{ridges}
							{metric}
							highlighted={ridges.some(
								(ridge) => ridge.slug === highlighted_post,
							)
								? highlighted_post
								: null}
						/>
					{:else}
						<div class="h-64 sm:h-96"></div>
					{/if}
				</div>
			</div>
		</div>
	</section>
{/if}
