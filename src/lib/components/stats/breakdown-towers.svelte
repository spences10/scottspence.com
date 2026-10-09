<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';
	import { scaleBand, scaleOrdinal } from 'd3-scale';
	import {
		Axis,
		Bars,
		Chart,
		Frame,
		Grid,
		isometric,
		Svg,
		Tooltip,
	} from 'layerchart';
	import { cubicInOut } from 'svelte/easing';
	import ChartViewControls from './chart-view-controls.svelte';
	import { settled_copy } from './stats.svelte';

	export interface BreakdownRow {
		label: string;
		visitors: number;
		views: number;
	}

	interface Props {
		title: string;
		rows: BreakdownRow[];
	}

	let { title, rows }: Props = $props();

	type Series = 'views' | 'visitors';
	type Tower = BreakdownRow & { series: Series; value: number };

	// Seen from above the towers are flat tiles; they rise as the
	// view tips over
	const flat_view = { rotate: 0, tilt: 0 };
	const raised_view = { rotate: -30, tilt: 62 };

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

	const shown = settled_copy(
		() => rows,
		[],
		() =>
			requestAnimationFrame(() => {
				if (rotate !== flat_view.rotate || tilt !== flat_view.tilt)
					return;
				reset();
			}),
	);

	const towers = $derived(
		series.flatMap(({ key }) =>
			shown.current.map((row): Tower => ({
				...row,
				series: key,
				value: row[key],
			})),
		),
	);
	const max_value = $derived(
		Math.max(1, ...towers.map((tower) => tower.value)),
	);

	const reset = () => {
		rotate = raised_view.rotate;
		tilt = raised_view.tilt;
	};

	const tick_label =
		'!stroke-transparent fill-[var(--color-base-content)] opacity-70 text-[11px]';
</script>

<div class="mb-1 flex flex-wrap items-center gap-3 px-2 text-xs">
	<h2 class="font-semibold">{title}</h2>
	{#each [...series].reverse() as item (item.key)}
		<span class="flex items-center gap-1">
			<span
				class="inline-block size-2 rounded-sm"
				style="background: {item.colour}"
			></span>
			{item.label}
		</span>
	{/each}
	<div class="ml-auto">
		<ChartViewControls
			label="{title.toLowerCase()} chart"
			on_turn={(degrees) => (rotate += degrees)}
			on_reset={reset}
		/>
	</div>
</div>

<div
	class="h-72 cursor-grab touch-pan-y select-none active:cursor-grabbing"
>
	{#if shown.current.length > 0}
		<Chart
			data={towers}
			x="label"
			xScale={scaleBand().paddingInner(0.25).paddingOuter(0.15)}
			xDomain={shown.current.map((row) => row.label)}
			y="series"
			yScale={scaleBand().paddingInner(0.35).paddingOuter(0.2)}
			yDomain={series.map((item) => item.key)}
			z="value"
			valueAxis="z"
			zDomain={[0, max_value]}
			zNice
			zRange={({ width }: { width: number }) => [0, width * 0.45]}
			c="series"
			cScale={scaleOrdinal()}
			cDomain={series.map((item) => item.key)}
			cRange={series.map((item) => item.colour)}
			view={isometric({
				rotate,
				tilt,
				// Never a long thin strip, however few rows there are
				aspect: Math.max(1.6, shown.current.length / 2.2),
				motion: { type: 'tween', duration: 700, easing: cubicInOut },
			})}
			transform={{ mode: 'canvas', drag: 'rotate' }}
			onTransform={({ rotation }) => {
				if (dragging && rotation) dragged_to = rotation;
			}}
			ondragstart={() => (dragging = true)}
			ondragend={commit_drag}
			tooltipContext={{ mode: 'manual' }}
			padding={{ top: 12, bottom: 28, left: 36, right: 12 }}
			clip
		>
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
					tickLabelProps={{ viewport: true }}
					classes={{ tickLabel: tick_label }}
				/>
				<Axis
					placement="back"
					ticks={3}
					format={(value: number) => number_crunch(value)}
					classes={{ tickLabel: tick_label }}
				/>
				<!-- Each tower is its own hit area: the floor cell under the
				     pointer may belong to a tower standing behind it -->
				<Bars
					tooltip
					strokeWidth={1}
					stroke="var(--color-base-200)"
				/>
			</Svg>

			<Tooltip.Root
				variant="none"
				classes={{
					container:
						'bg-base-100 text-base-content rounded-lg border border-base-300 px-3 py-2 text-sm shadow-lg',
				}}
			>
				{#snippet children({ data }: { data: Tower })}
					<Tooltip.Header>
						<span class="text-xs font-medium text-base-content/70">
							{data.label}
						</span>
					</Tooltip.Header>
					<Tooltip.List>
						<Tooltip.Item
							label="Visitors"
							value={number_crunch(data.visitors)}
							classes={{ label: 'text-secondary' }}
						/>
						<Tooltip.Item
							label="Views"
							value={number_crunch(data.views)}
							classes={{ label: 'text-primary' }}
						/>
					</Tooltip.List>
				{/snippet}
			</Tooltip.Root>
		</Chart>
	{/if}
</div>
