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
		Text,
		Tooltip,
	} from 'layerchart';
	import { cubicInOut } from 'svelte/easing';
	import {
		month_labels,
		type HistoricalMetric,
		type MonthCell,
	} from './stats.svelte';

	interface Props {
		cells: MonthCell[];
		years: string[];
		metric: HistoricalMetric;
		selected_year: string | null;
		selected_month: number | null;
		on_select: (year: string, month: number) => void;
	}

	let {
		cells,
		years,
		metric,
		selected_year,
		selected_month,
		on_select,
	}: Props = $props();

	// Months run across and years step back, oldest at the front, so
	// the taller recent years stand behind the shorter early ones
	const default_rotate = -24;
	const default_tilt = 67;

	// Narrow charts have no room for whole month and year labels
	let chart_width = $state(0);
	const compact = $derived(chart_width > 0 && chart_width < 560);

	let flat = $state(false);
	let rotate = $state(default_rotate);
	let tilt = $state(default_tilt);
	let dragging = false;
	// A drag that ends over a tower still fires its click
	let pointer_down = { x: 0, y: 0 };

	const steps = 5;
	const hue = $derived(
		metric === 'views'
			? 'var(--color-primary)'
			: 'var(--color-secondary)',
	);
	// One hue, more is darker; the other years step back to grey
	// while a single year is selected
	const ramp = $derived(
		[22, 40, 58, 78, 100].map(
			(share) =>
				`color-mix(in oklab, ${hue} ${share}%, var(--color-base-200))`,
		),
	);
	const muted_ramp = [3, 5, 7, 9, 11].map(
		(share) =>
			`color-mix(in oklab, var(--color-base-content) ${share}%, var(--color-base-200))`,
	);
	const selected_fill = 'var(--color-accent)';
	const fills = $derived([...ramp, ...muted_ramp, selected_fill]);

	const max_value = $derived(
		Math.max(1, ...cells.map((cell) => cell[metric])),
	);

	// Every signal is read once, up front: layerchart reads the data
	// many times over while it sorts the towers by depth
	const towers = $derived.by(() => {
		const colours = ramp;
		const year = selected_year;
		// Shaded against the tallest tower in the selected year
		const max = Math.max(
			1,
			...cells
				.filter((cell) => !year || cell.year === year)
				.map((cell) => cell[metric]),
		);
		const month = selected_month;
		const key = metric;
		return cells.map((cell) => {
			const value = cell[key];
			const step = Math.min(
				steps - 1,
				Math.floor((value / max) * steps),
			);
			return {
				...cell,
				value,
				label: month_labels[cell.month - 1],
				fill:
					cell.year === year && cell.month === month
						? selected_fill
						: !year || cell.year === year
							? colours[step]
							: muted_ramp[step],
			};
		});
	});

	// The one direct label: the tallest tower in view
	const peak = $derived.by(() => {
		const in_view = towers.filter(
			(tower) => !selected_year || tower.year === selected_year,
		);
		const tallest = in_view.reduce<(typeof towers)[number] | null>(
			(best, tower) =>
				!best || tower.value > best.value ? tower : best,
			null,
		);
		return tallest ? [tallest] : [];
	});

	const turn = (degrees: number) => {
		flat = false;
		rotate += degrees;
	};

	const reset_view = () => {
		flat = false;
		rotate = default_rotate;
		tilt = default_tilt;
	};

	const tick_label =
		'!stroke-transparent fill-[var(--color-base-content)] opacity-70 text-[11px]';
</script>

<div class="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
	<span class="flex items-center gap-2">
		<span class="opacity-80">Fewer</span>
		<span class="flex gap-0.5" aria-hidden="true">
			{#each ramp as colour (colour)}
				<span
					class="inline-block size-3 rounded-sm"
					style="background: {colour}"
				></span>
			{/each}
		</span>
		<span class="opacity-80">
			More {metric === 'views' ? 'views' : 'visitors'}
		</span>
	</span>
	<span class="hidden opacity-70 sm:inline">
		Drag to turn · select a tower to filter
	</span>
	<div class="join ml-auto">
		<button
			class="btn join-item btn-xs"
			aria-label="Turn chart left"
			onclick={() => turn(-45)}
		>
			↺
		</button>
		<button
			class="btn join-item btn-xs"
			aria-label="Turn chart right"
			onclick={() => turn(45)}
		>
			↻
		</button>
		<button
			class="btn join-item btn-xs {flat ? 'btn-primary' : ''}"
			aria-pressed={flat}
			onclick={() => (flat = !flat)}
		>
			Flat
		</button>
		<button class="btn join-item btn-xs" onclick={reset_view}>
			Reset
		</button>
	</div>
</div>

<div
	class="h-64 cursor-grab touch-pan-y select-none active:cursor-grabbing sm:h-120"
	bind:clientWidth={chart_width}
	onpointerdowncapture={(event) =>
		(pointer_down = { x: event.clientX, y: event.clientY })}
>
	<Chart
		data={towers}
		x="label"
		xScale={scaleBand().paddingInner(0.18).paddingOuter(0.1)}
		xDomain={month_labels}
		y="year"
		yScale={scaleBand().paddingInner(0.3).paddingOuter(0.15)}
		yDomain={[...years].reverse()}
		z="value"
		valueAxis="z"
		zDomain={[0, max_value]}
		zNice
		zRange={({ height }: { height: number }) => [0, height * 0.8]}
		c="fill"
		cScale={scaleOrdinal()}
		cDomain={fills}
		cRange={fills}
		view={isometric({
			rotate: flat ? 0 : rotate,
			tilt: flat ? 0 : tilt,
			motion: { type: 'tween', duration: 700, easing: cubicInOut },
		})}
		transform={{
			mode: 'canvas',
			drag: 'rotate',
			disablePointer: flat,
		}}
		onTransform={({ rotation }) => {
			// Keep the buttons turning from wherever a drag left the view
			if (!dragging || !rotation) return;
			rotate = rotation.x;
			tilt = rotation.y;
		}}
		ondragstart={() => (dragging = true)}
		ondragend={() => (dragging = false)}
		tooltipContext={{ mode: 'manual' }}
		padding={{ top: 16, bottom: 28, left: 40, right: 16 }}
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
				format={(label: string) => (compact ? label[0] : label)}
				tickLabelProps={{ viewport: true }}
				classes={{ tickLabel: tick_label }}
			/>
			<Axis
				placement="left"
				format={(year: string) =>
					compact ? `’${year.slice(2)}` : year}
				tickLabelProps={{ viewport: true }}
				classes={{ tickLabel: tick_label }}
			/>
			{#if !flat}
				<Axis
					placement="back"
					ticks={4}
					format={(value: number) => number_crunch(value)}
					classes={{ tickLabel: tick_label }}
				/>
			{/if}
			<!-- Each tower is its own hit area: the floor cell under the
			     pointer may belong to a tower standing behind it -->
			<Bars
				tooltip
				strokeWidth={1}
				stroke="var(--color-base-200)"
				class="skyline-tower cursor-pointer"
				onBarClick={(event, { data }) => {
					const moved = Math.hypot(
						event.clientX - pointer_down.x,
						event.clientY - pointer_down.y,
					);
					if (moved < 4) on_select(data.year, data.month);
				}}
			/>
			{#if peak.length > 0 && !flat}
				<Text
					data={peak}
					x={(tower: { label: string }) => tower.label}
					y={(tower: { year: string }) => tower.year}
					z="value"
					value={(tower: { value: number }) =>
						number_crunch(tower.value)}
					viewport
					textAnchor="middle"
					dy={-10}
					class="pointer-events-none fill-(--color-base-content) stroke-(--color-base-200)! stroke-[3px] text-xs font-semibold [paint-order:stroke]"
				/>
			{/if}
		</Svg>

		<Tooltip.Root
			variant="none"
			classes={{
				container:
					'bg-base-100 text-base-content rounded-lg border border-base-300 px-3 py-2 text-sm shadow-lg',
			}}
		>
			{#snippet children({ data }: { data: MonthCell })}
				<Tooltip.Header>
					<span class="text-xs font-medium text-base-content/70">
						{month_labels[data.month - 1]}
						{data.year}
					</span>
				</Tooltip.Header>
				<Tooltip.List>
					<Tooltip.Item
						label="Views"
						value={number_crunch(data.views)}
					/>
					<Tooltip.Item
						label="Visitors"
						value={number_crunch(data.visitors)}
					/>
				</Tooltip.List>
			{/snippet}
		</Tooltip.Root>
	</Chart>
</div>

<style>
	:global(.lc-rect-box:has(.skyline-tower):hover .lc-rect) {
		filter: brightness(1.15);
	}
</style>
