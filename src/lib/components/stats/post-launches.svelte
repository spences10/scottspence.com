<script lang="ts">
	import { get_launch_board } from '#lib/data/post-trends.remote.js';
	import { number_crunch } from '#lib/utils/index.js';
	import { BarChart, Tooltip } from 'layerchart';
	import { onMount, settled } from 'svelte';
	import StatRow from './stat-row.svelte';

	const board = $derived(await get_launch_board());

	// Charts wait for the async batch above to settle: mounted while it
	// is pending, their derived state locks the page up
	let mounted = $state(false);
	onMount(async () => {
		await settled();
		mounted = true;
	});

	const fmt = (n: number) => Math.round(n).toLocaleString('en-GB');
	const short_date = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC',
		});
	const month_tick = (iso: string) =>
		new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
			month: 'short',
			timeZone: 'UTC',
		});

	// Oldest first, so the chart reads left to right through the year
	const chart_data = $derived(
		(board?.launches ?? [])
			.map((launch) => ({
				...launch,
				partial: launch.days_live < (board?.days ?? 0),
			}))
			.reverse(),
	);
	// One tick for the first launch of each month
	const month_ticks = $derived(
		chart_data
			.filter(
				(d, i) =>
					i === 0 ||
					d.pub.slice(0, 7) !== chart_data[i - 1].pub.slice(0, 7),
			)
			.map((d) => d.slug),
	);
	const summary = $derived(
		board
			? `Views in each post's first ${board.days} days, counted from the first day it had views.${board.median != null ? ` The median is ${fmt(board.median)}.` : ''}`
			: '',
	);
	const max_views = $derived(
		Math.max(0, ...(board?.launches ?? []).map((l) => l.views)),
	);
</script>

{#if board && board.launches.length > 0}
	<section class="mt-12" aria-labelledby="post-launches-heading">
		<header class="mb-4">
			<h2 id="post-launches-heading" class="text-2xl font-bold">
				New posts
			</h2>
			<p class="text-sm text-base-content/70">
				{summary}
			</p>
		</header>

		<div class="rounded-box bg-base-200 p-4">
			<div class="h-64" data-testid="launches-chart">
				{#if mounted}
					<BarChart
						data={chart_data}
						x="slug"
						y="views"
						c={(d: (typeof chart_data)[number]) =>
							d.partial ? 'partial' : 'full'}
						cDomain={['full', 'partial']}
						cRange={[
							'var(--color-primary)',
							'color-mix(in oklab, var(--color-primary) 35%, transparent)',
						]}
						padding={{ left: 40, bottom: 24, top: 8, right: 8 }}
						annotations={board.median != null
							? [
									{
										type: 'line',
										y: board.median,
										label: 'Median',
										labelXOffset: 4,
										labelYOffset: 4,
										props: {
											line: {
												class: 'stroke-secondary',
												dashArray: [4, 4],
											},
											label: { class: 'fill-secondary text-xs' },
										},
									},
								]
							: []}
						props={{
							bars: { strokeWidth: 0, radius: 3, rounded: 'top' },
							xAxis: {
								ticks: month_ticks,
								format: (slug: string) => {
									const launch = chart_data.find(
										(d) => d.slug === slug,
									);
									return launch ? month_tick(launch.pub) : '';
								},
							},
							yAxis: { format: (v: number) => number_crunch(v) },
						}}
					>
						{#snippet tooltip()}
							<Tooltip.Root
								variant="none"
								classes={{
									container:
										'bg-base-100 text-base-content max-w-xs rounded-lg border border-base-300 px-3 py-2 text-sm shadow-lg',
								}}
							>
								{#snippet children({
									data,
								}: {
									data: (typeof chart_data)[number];
								})}
									<Tooltip.Header>
										<span class="font-medium">{data.title}</span>
									</Tooltip.Header>
									<Tooltip.List>
										<Tooltip.Item
											label={data.partial
												? `${data.days_live} days so far`
												: `First ${board.days} days`}
											value={fmt(data.views)}
										/>
										<Tooltip.Item
											label="Published"
											value={short_date(data.pub)}
										/>
									</Tooltip.List>
								{/snippet}
							</Tooltip.Root>
						{/snippet}
					</BarChart>
				{/if}
			</div>
			<p class="mt-2 text-xs text-base-content/60">
				Faded bars are posts still inside their first {board.days} days.
			</p>

			<details class="mt-4">
				<summary class="cursor-pointer text-sm">View as list</summary>
				<div class="mt-2">
					{#each board.launches as launch (launch.slug)}
						<StatRow
							label={launch.days_live < board.days
								? `${launch.title} (${launch.days_live} days so far)`
								: launch.title}
							value={launch.views}
							max_value={max_views}
							href={`/posts/${launch.slug}`}
						/>
					{/each}
				</div>
			</details>
		</div>
	</section>
{/if}
