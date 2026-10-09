<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';
	import { scaleBand } from 'd3-scale';
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
	import ChartViewControls from './chart-view-controls.svelte';
	import {
		smooth_curve,
		type HistoricalMetric,
	} from './stats.svelte';

	export interface Ridge {
		slug: string;
		title: string;
		points: { index: number; label: string; value: number }[];
	}

	interface Props {
		ridges: Ridge[];
		metric: HistoricalMetric;
		// A post picked out elsewhere, such as a hovered row in the list
		highlighted?: string | null;
		// Laid out for a full-width card: a longer floor, whole titles
		wide?: boolean;
		hint?: string;
	}

	let {
		ridges,
		metric,
		highlighted = null,
		wide = false,
		hint = 'Drag to turn · hover a ridge',
	}: Props = $props();

	type Point = Ridge['points'][number] & {
		slug: string;
		title: string;
	};

	const default_view = { rotate: -32, tilt: 66 };
	// Seen from the front, edge on to the floor, the ridges overlap as
	// a flat area chart
	const flat_view = { rotate: 0, tilt: 90 };

	// Narrow charts have no room for the post titles
	let chart_width = $state(0);
	const compact = $derived(chart_width > 0 && chart_width < 440);
	// A full-width card has room for most titles whole
	const roomy = $derived(wide && chart_width >= 880);
	const title_length = $derived(roomy ? 44 : 20);

	let flat = $state(false);
	let rotate = $state(default_view.rotate);
	let tilt = $state(default_view.tilt);
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

	const turn = (degrees: number) => {
		flat = false;
		rotate += degrees;
	};

	const reset_view = () => {
		flat = false;
		rotate = default_view.rotate;
		tilt = default_view.tilt;
	};

	const hue = $derived(
		metric === 'views'
			? 'var(--color-primary)'
			: 'var(--color-secondary)',
	);
	// The flat charts' fill: the hue fading out towards the floor
	const fill_stops = $derived([
		`color-mix(in oklab, ${hue} 75%, transparent)`,
		`color-mix(in oklab, ${hue} 12%, transparent)`,
	]);

	const slugs = $derived(ridges.map((ridge) => ridge.slug));
	const points = $derived(
		ridges.flatMap((ridge) =>
			ridge.points.map((point): Point => ({
				...point,
				slug: ridge.slug,
				title: ridge.title,
			})),
		),
	);
	// What is drawn for each post; the tooltip keeps to the real points
	const curves_by_slug = $derived(
		new Map(
			ridges.map((ridge) => [
				ridge.slug,
				smooth_curve(
					ridge.points.map((point) => ({
						x: point.index,
						y: point.value,
					})),
				).map(({ x, y }) => ({
					index: x,
					value: y,
					slug: ridge.slug,
				})),
			]),
		),
	);
	const labels = $derived(
		ridges[0]?.points.map((point) => point.label) ?? [],
	);
	const max_value = $derived(
		Math.max(1, ...points.map((point) => point.value)),
	);

	const row_label = (slug: string) => {
		const index = slugs.indexOf(slug);
		const title = ridges[index]?.title ?? '';
		if (compact) return `${index + 1}`;
		return title.length > title_length
			? `${title.slice(0, title_length - 1).trimEnd()}…`
			: title;
	};

	const tick_label =
		'!stroke-transparent fill-[var(--color-base-content)] opacity-70 text-[11px]';
</script>

<div
	class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 px-2 text-xs"
>
	<span class="hidden opacity-70 sm:inline">
		{hint}
	</span>
	<div class="ml-auto">
		<ChartViewControls
			label="top posts chart"
			{flat}
			on_turn={turn}
			on_reset={reset_view}
			on_flat={() => (flat = !flat)}
		/>
	</div>
</div>

<div
	class="h-64 cursor-grab touch-pan-y select-none active:cursor-grabbing {wide
		? 'sm:h-120'
		: 'sm:h-96'}"
	bind:clientWidth={chart_width}
>
	<Chart
		data={points}
		x="index"
		xDomain={[0, Math.max(1, labels.length - 1)]}
		y="slug"
		yScale={scaleBand().paddingInner(0.5).paddingOuter(0.25)}
		yDomain={slugs}
		z="value"
		zDomain={[0, max_value]}
		zNice
		zRange={({ width }: { width: number }) => [
			0,
			width * (roomy ? 0.16 : 0.28),
		]}
		view={isometric({
			rotate: flat ? flat_view.rotate : rotate,
			tilt: flat ? flat_view.tilt : tilt,
			aspect: roomy ? 2.6 : 1.5,
			motion: { type: 'tween', duration: 700, easing: cubicInOut },
		})}
		transform={{ mode: 'canvas', drag: 'rotate' }}
		onTransform={({ rotation }) => {
			if (dragging && rotation) dragged_to = rotation;
		}}
		ondragstart={() => (dragging = true)}
		ondragend={commit_drag}
		tooltipContext={{ mode: 'quadtree' }}
		padding={{
			top: 16,
			bottom: 36,
			left: compact || flat ? 36 : roomy ? 256 : 128,
			right: 32,
		}}
		clip
	>
		{#snippet children({ context })}
			{@const matrix = context.isometricMatrix}
			<!-- The ridge under the pointer, else the one picked in the list -->
			{@const active =
				(context.tooltip.data as { slug: string } | null)?.slug ??
				highlighted}
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
					ticks={6}
					format={(index: number) => labels[Math.round(index)] ?? ''}
					tickLabelProps={{ viewport: true }}
					classes={{ tickLabel: tick_label }}
				/>
				<!-- Seen from the front, the rows line up behind one another -->
				{#if !flat}
					<Axis
						placement="left"
						format={row_label}
						tickLabelProps={{ viewport: true }}
						classes={{ tickLabel: tick_label }}
					/>
				{/if}
				<Axis
					placement="back"
					ticks={3}
					format={(value: number) => number_crunch(value)}
					classes={{ tickLabel: tick_label }}
				/>
				<!-- Back to front: each curtain stands in its own row, so
				     the farther rows are drawn first -->
				{#each [...ridges].sort( (a, b) => (matrix ? matrix.d * (context.yScale(a.slug) - context.yScale(b.slug)) : 0) ) as ridge (ridge.slug)}
					{@const faded = active !== null && active !== ridge.slug}
					<LinearGradient stops={fill_stops} vertical>
						{#snippet children({ gradient })}
							<Area
								data={curves_by_slug.get(ridge.slug)}
								fill={gradient}
								fillOpacity={faded ? 0.2 : active ? 1 : 0.85}
								line={{
									stroke: hue,
									strokeWidth: 2,
									opacity: faded ? 0.35 : 1,
								}}
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
						'bg-base-100 text-base-content rounded-lg border border-base-300 px-3 py-2 text-sm shadow-lg max-w-64',
				}}
			>
				{#snippet children({
					data,
				}: {
					data: { slug: string; index: number };
				})}
					<!-- The pointer may be nearest a point on the smoothed
					     curve; the tooltip reads the real month beside it -->
					{@const rank = slugs.indexOf(data.slug)}
					{@const point =
						ridges[rank]?.points[Math.round(data.index)]}
					{#if point}
						<Tooltip.Header>
							<span class="text-xs font-medium text-base-content/70">
								{point.label}
							</span>
						</Tooltip.Header>
						<p class="mb-1 text-sm font-medium text-wrap">
							{rank + 1}. {ridges[rank].title}
						</p>
						<Tooltip.List>
							<Tooltip.Item
								label={metric === 'views' ? 'Views' : 'Visitors'}
								value={number_crunch(point.value)}
							/>
						</Tooltip.List>
					{/if}
				{/snippet}
			</Tooltip.Root>
		{/snippet}
	</Chart>
</div>
