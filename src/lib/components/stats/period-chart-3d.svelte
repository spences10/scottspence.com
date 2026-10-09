<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';
	import { scaleBand, scaleTime } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import {
		Area,
		Axis,
		Chart,
		Frame,
		Grid,
		Highlight,
		isometric,
		Svg,
		Tooltip,
	} from 'layerchart';
	import { cubicInOut } from 'svelte/easing';
	import { settled_copy } from './stats.svelte';

	interface Props {
		points: { date: Date; views: number; visitors: number }[];
		// Hourly periods label the time, longer ones the day
		hourly: boolean;
		// Lowered to lay the chart flat again before it is swapped out
		raised: boolean;
		on_flat: () => void;
	}

	let { points, hourly, raised, on_flat }: Props = $props();

	type Series = 'views' | 'visitors';
	type Row = { date: Date; series: Series; value: number };

	const tween_ms = 700;
	// Seen from the front, edge on to the floor, the curtains overlap
	// as the flat area chart does
	const flat_view = { rotate: 0, tilt: 90 };
	const raised_view = { rotate: -20, tilt: 72 };

	// Views are the taller series, so they stand at the back
	const series: { key: Series; label: string; colour: string }[] = [
		{ key: 'views', label: 'Views', colour: 'var(--color-primary)' },
		{
			key: 'visitors',
			label: 'Visitors',
			colour: 'var(--color-secondary)',
		},
	];

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
	const shown = settled_copy(
		() => points,
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

	const rows = $derived(
		series.flatMap(({ key }) =>
			shown.current.map((point): Row => ({
				date: point.date,
				series: key,
				value: point[key],
			})),
		),
	);
	const rows_by_series = $derived(
		series.map((item) => ({
			...item,
			rows: rows.filter((row) => row.series === item.key),
		})),
	);
	const max_value = $derived(
		Math.max(1, ...rows.map((row) => row.value)),
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
			yDomain={series.map((item) => item.key)}
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
			padding={{ top: 12, bottom: 28, left: 40, right: 16 }}
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
					<Axis
						placement="back"
						ticks={4}
						format={(value: number) => number_crunch(value)}
						classes={{ tickLabel: tick_label }}
					/>
					<!-- Back to front: each curtain stands in its own row -->
					{#each [...rows_by_series].sort( (a, b) => (matrix ? matrix.d * (context.yScale(a.key) - context.yScale(b.key)) : 0) ) as item (item.key)}
						<Area
							data={item.rows}
							curve={curveMonotoneX}
							fill={item.colour}
							fillOpacity={0.5}
							line={{ stroke: item.colour, strokeWidth: 2 }}
						/>
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
						{@const point = shown.current.find(
							(item) => item.date.getTime() === data.date.getTime(),
						)}
						<Tooltip.Header>
							<span class="text-xs font-medium text-base-content/70">
								{format_date(data.date, true)}
							</span>
						</Tooltip.Header>
						<Tooltip.List>
							<Tooltip.Item
								label="Visitors"
								value={number_crunch(point?.visitors ?? 0)}
								classes={{ label: 'text-secondary' }}
							/>
							<Tooltip.Item
								label="Views"
								value={number_crunch(point?.views ?? 0)}
								classes={{ label: 'text-primary' }}
							/>
						</Tooltip.List>
					{/snippet}
				</Tooltip.Root>
			{/snippet}
		</Chart>
	{/if}
</div>
