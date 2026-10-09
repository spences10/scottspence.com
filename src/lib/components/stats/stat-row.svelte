<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';

	interface Props {
		label: string;
		value: number;
		max_value: number;
		href?: string;
		prefix?: string;
		label_class?: string;
	}

	let {
		label,
		value,
		max_value,
		href,
		prefix,
		label_class = '',
	}: Props = $props();

	const bar_width = $derived(
		max_value > 0 ? (value / max_value) * 100 : 0,
	);
</script>

<div class="relative flex h-9 items-center gap-3 px-2 text-sm">
	<div
		class="absolute inset-y-0.5 left-0 rounded bg-current opacity-10 transition-[width] duration-300 motion-reduce:transition-none"
		style="width: {bar_width}%"
	></div>
	<span class="relative flex min-w-0 flex-1 items-center gap-2">
		{#if prefix}
			<span aria-hidden="true">{prefix}</span>
		{/if}
		{#if href}
			<a {href} class="truncate link-hover {label_class}">{label}</a>
		{:else}
			<span class="truncate {label_class}">{label}</span>
		{/if}
	</span>
	<span class="relative shrink-0 text-right tabular-nums">
		{number_crunch(value)}
	</span>
</div>
