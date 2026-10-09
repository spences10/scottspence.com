<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';
	import { scaleBand } from 'd3-scale';
	import { curveMonotoneX } from 'd3-shape';
	import {
		Area,
		Axis,
		Chart,
		Frame,
		Grid,
		isometric,
		Svg,
	} from 'layerchart';
	import type { HistoricalMetric } from './stats.svelte';

	export interface Ridge {
		slug: string;
		title: string;
		points: { index: number; label: string; value: number }[];
	}

	interface Props {
		ridges: Ridge[];
		metric: HistoricalMetric;
	}

	let { ridges, metric }: Props = $props();

	const hue = $derived(
		metric === 'views'
			? 'var(--color-primary)'
			: 'var(--color-secondary)',
	);

	const slugs = $derived(ridges.map((ridge) => ridge.slug));
	const points = $derived(
		ridges.flatMap((ridge) =>
			ridge.points.map((point) => ({ ...point, slug: ridge.slug })),
		),
	);
	const labels = $derived(
		ridges[0]?.points.map((point) => point.label) ?? [],
	);
	const max_value = $derived(
		Math.max(1, ...points.map((point) => point.value)),
	);

	const tick_label =
		'!stroke-transparent fill-[var(--color-base-content)] opacity-70 text-[11px]';
</script>

<div class="h-64 sm:h-96">
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
		zRange={({ width }: { width: number }) => [0, width * 0.28]}
		view={isometric({ rotate: -32, tilt: 66, aspect: 1.5 })}
		padding={{ top: 16, bottom: 36, left: 36, right: 16 }}
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
					ticks={6}
					format={(index: number) => labels[Math.round(index)] ?? ''}
					tickLabelProps={{ viewport: true }}
					classes={{ tickLabel: tick_label }}
				/>
				<Axis
					placement="left"
					format={(slug: string) => `${slugs.indexOf(slug) + 1}`}
					tickLabelProps={{ viewport: true }}
					classes={{ tickLabel: tick_label }}
				/>
				<Axis
					placement="back"
					ticks={3}
					format={(value: number) => number_crunch(value)}
					classes={{ tickLabel: tick_label }}
				/>
				<!-- Back to front: each curtain stands in its own row, so
				     the farther rows are drawn first -->
				{#each [...ridges].sort( (a, b) => (matrix ? matrix.d * (context.yScale(a.slug) - context.yScale(b.slug)) : 0) ) as ridge (ridge.slug)}
					<Area
						data={points.filter((point) => point.slug === ridge.slug)}
						curve={curveMonotoneX}
						fill={hue}
						fillOpacity={0.55}
						line={{ stroke: hue, strokeWidth: 2 }}
					/>
				{/each}
			</Svg>
		{/snippet}
	</Chart>
</div>
