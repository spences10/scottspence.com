<script lang="ts">
	import type { PeriodCounts } from '#lib/analytics/period-stats.helpers.js';
	import { number_crunch } from '#lib/utils/index.js';

	interface Props {
		label: string;
		visitors: number;
		views: number;
		max_value: number;
		href?: string;
		prefix?: string;
		icon?: string;
		label_class?: string;
		previous?: PeriodCounts | null;
		bar?: 'visitors' | 'views';
		format_delta?: (delta: number) => string;
	}

	let {
		label,
		visitors,
		views,
		max_value,
		href,
		prefix,
		icon,
		label_class = '',
		previous = null,
		bar = 'visitors',
		format_delta = String,
	}: Props = $props();

	const bar_width = $derived(
		max_value > 0
			? ((bar === 'views' ? views : visitors) / max_value) * 100
			: 0,
	);
</script>

<li class="relative flex h-9 items-center gap-3 px-2 text-sm">
	<div
		class="absolute inset-y-0.5 left-0 rounded bg-current opacity-10"
		style="width: {bar_width}%"
	></div>
	<span class="relative flex min-w-0 flex-1 items-center gap-2">
		{#if icon}
			<svg
				viewBox="0 0 24 24"
				class="size-4 shrink-0 fill-current opacity-80"
				aria-hidden="true"
			>
				<path d={icon} />
			</svg>
		{/if}
		{#if prefix}
			<span class="shrink-0" aria-hidden="true">{prefix}</span>
		{/if}
		{#if href}
			<a {href} class="truncate link-hover {label_class}">{label}</a>
		{:else}
			<span class="truncate {label_class}">{label}</span>
		{/if}
	</span>
	{#snippet count(
		value: number,
		before: number | undefined,
		muted = '',
	)}
		<span
			class="relative w-14 shrink-0 text-right tabular-nums sm:w-20 {muted}"
		>
			{#if before !== undefined && value !== before}
				<span class="mr-1 hidden text-xs opacity-70 sm:inline">
					{format_delta(value - before)}
				</span>
			{/if}
			{number_crunch(value)}
		</span>
	{/snippet}
	{@render count(visitors, previous?.visitors)}
	{@render count(views, previous?.views, 'opacity-70')}
</li>
