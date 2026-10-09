<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';
	import { scaleBand, scaleTime } from 'd3-scale';
	import {
		Area,
		Axis,
		Chart,
		Frame,
		Grid,
		Highlight,
		isometric,
		LinearGradient,
		Svg,
		Tooltip,
	} from 'layerchart';
	import { cubicInOut } from 'svelte/easing';
	import { settled_copy, smooth_curve } from './stats.svelte';

	export interface ChartSeries {
		key: string;
		label: string;
		colour: string;
		points: { date: Date; value: number }[];
	}

	interface Props {
		// One curtain each, the first standing at the back
		series: ChartSeries[];
		// Hourly periods label the time, longer ones the day
		hourly: boolean;
		// Lowered to lay the chart flat again before it is swapped out
		raised: boolean;
		on_flat: () => void;
	}

	let { series, hourly, raised, on_flat }: Props = $props();

	type Row = { date: Date; series: string; value: number };

	const tween_ms = 700;
	// Seen from the front, edge on to the floor, the curtains overlap
	// as the flat area chart does
	const flat_view = { rotate: 0, tilt: 90 };
	const raised_view = { rotate: -20, tilt: 72 };

	let rotate = $state(flat_view.rotate);
	let tilt = $state(flat_view.tilt);
	let dragging = false;
	// Where a drag has turned the view to. Only written back when the
	// drag ends, so the buttons turn from there: writing it every
	// frame rebuilds the view under the pointer and the drag stutters
	let dragged_to: { x: number; y: number } | null = null;

	const commit_drag = () => {
		dragging = false;
		if (!dragged_to) return;
		rotate = dragged_to.x;
		tilt = dragged_to.y;
		dragged_to = null;
	};

	// Mounts flat, then stands up
	let stood_up = $state(false);
	// The last series with data stay up while new ones load
	let loaded: ChartSeries[] = [];
	const shown = settled_copy(
		() => {
			if (series.length > 0) loaded = series;
			return loaded;
		},
		[],
		() => requestAnimationFrame(() => (stood_up = true)),
	);

	export const turn = (degrees: number) => {
		rotate += degrees;
	};

	export const reset = () => {
		rotate = raised_view.rotate;
		tilt = raised_view.tilt;
	};

	$effect(() => {
		const view = raised && stood_up ? raised_view : flat_view;
		rotate = view.rotate;
		tilt = view.tilt;
		if (raised) return;
		const timeout = setTimeout(on_flat, tween_ms);
		return () => clearTimeout(timeout);
	});

	const rows_by_series = $derived(
		shown.current.map((item) => ({
			...item,
			rows: item.points.map((point): Row => ({
				...point,
				series: item.key,
			})),
			// What is drawn; the tooltip keeps to the real points
			curve: smooth_curve(
				item.points.map((point) => ({
					x: point.date.getTime(),
					y: point.value,
				})),
			).map(({ x, y }): Row => ({
				date: new Date(x),
				series: item.key,
				value: y,
			})),
		})),
	);
	const rows = $derived(rows_by_series.flatMap((item) => item.rows));
	const max_value = $derived(
		Math.max(1, ...rows.map((row) => row.value)),
	);

	const nearest_row = (candidates: Row[], date: Date) =>
		candidates.reduce<Row | null>(
			(nearest, row) =>
				!nearest ||
				Math.abs(row.date.getTime() - date.getTime()) <
					Math.abs(nearest.date.getTime() - date.getTime())
					? row
					: nearest,
			null,
		);

	const format_date = (date: Date, long = false) =>
		hourly
			? date.toLocaleTimeString('en-GB', {
					hour: '2-digit',
					minute: '2-digit',
				})
			: date.toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'short',
					year: long ? 'numeric' : undefined,
				});

	const tick_label =
		'!stroke-transparent fill-[var(--color-base-content)] opacity-70';
</script>

<!-- Taller once raised, so the turned floor has the card's width -->
<div
	class="cursor-grab touch-pan-y transition-[height] duration-700 select-none active:cursor-grabbing {raised &&
	stood_up
		? 'h-72 sm:h-104'
		: 'h-72'}"
>
	{#if shown.current.length > 0}
		<Chart
			data={rows}
			x="date"
			xScale={scaleTime()}
			y="series"
			yScale={scaleBand().paddingInner(0.6).paddingOuter(0.3)}
			yDomain={shown.current.map((item) => item.key)}
			z="value"
			zDomain={[0, max_value]}
			zNice
			zRange={({ width }: { width: number }) => [0, width * 0.2]}
			view={isometric({
				rotate,
				tilt,
				aspect: 4,
				motion: {
					type: 'tween',
					duration: tween_ms,
					easing: cubicInOut,
				},
			})}
			transform={{ mode: 'canvas', drag: 'rotate' }}
			onTransform={({ rotation }) => {
				if (dragging && rotation) dragged_to = rotation;
			}}
			ondragstart={() => (dragging = true)}
			ondragend={commit_drag}
			tooltipContext={{ mode: 'quadtree' }}
			padding={{ top: 12, bottom: 28, left: 64, right: 16 }}
			clip
		>
			{#snippet children({ context })}
				{@const matrix = context.isometricMatrix}
				<Svg>
					<Frame
						class="fill-(--color-base-content)/3 stroke-(--color-base-content)/15"
					/>
					<Grid
						z
						classes={{
							line: 'stroke-[var(--color-base-content)] opacity-15',
						}}
					/>
					<Axis
						placement="bottom"
						ticks={7}
						format={(date: Date) => format_date(date)}
						tickLabelProps={{ viewport: true }}
						classes={{ tickLabel: tick_label }}
					/>
					<!-- Each row is named, so the series are not told apart
					     by colour alone. Seen from the front they overlap -->
					{#if raised && stood_up}
						<Axis
							placement="left"
							format={(key: string) =>
								shown.current.find((item) => item.key === key)
									?.label ?? ''}
							tickLabelProps={{ viewport: true }}
							classes={{ tickLabel: tick_label }}
						/>
					{/if}
					<Axis
						placement="back"
						ticks={4}
						format={(value: number) => number_crunch(value)}
						classes={{ tickLabel: tick_label }}
					/>
					<!-- Back to front: each curtain stands in its own row -->
					{#each [...rows_by_series].sort( (a, b) => (matrix ? matrix.d * (context.yScale(a.key) - context.yScale(b.key)) : 0) ) as item (item.key)}
						<!-- The flat chart's fill: the colour fading out
						     towards the floor -->
						<LinearGradient
							stops={[
								`color-mix(in oklab, ${item.colour} 70%, transparent)`,
								`color-mix(in oklab, ${item.colour} 10%, transparent)`,
							]}
							vertical
						>
							{#snippet children({ gradient })}
								<Area
									data={item.curve}
									fill={gradient}
									line={{ stroke: item.colour, strokeWidth: 2 }}
								/>
							{/snippet}
						</LinearGradient>
					{/each}
					<Highlight points />
				</Svg>
				<Tooltip.Root
					variant="none"
					classes={{
						container:
							'bg-base-100 text-base-content rounded-lg border border-base-300 px-3 py-2 text-sm shadow-lg',
					}}
				>
					{#snippet children({ data }: { data: Row })}
						<!-- The pointer may be nearest a point on the smoothed
						     curve; the tooltip reads the real one beside it -->
						{@const date =
							nearest_row(
								rows_by_series.find(
									(item) => item.key === data.series,
								)?.rows ?? [],
								data.date,
							)?.date ?? data.date}
						<Tooltip.Header>
							<span class="text-xs font-medium text-base-content/70">
								{format_date(date, true)}
							</span>
						</Tooltip.Header>
						<Tooltip.List>
							<!-- Front row first, as the legend lists them -->
							{#each [...rows_by_series].reverse() as item (item.key)}
								{@const row = item.rows.find(
									(candidate) =>
										candidate.date.getTime() === date.getTime(),
								)}
								<Tooltip.Item
									label={item.label}
									value={number_crunch(row?.value ?? 0)}
								/>
							{/each}
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</Chart>
	{/if}
</div>
