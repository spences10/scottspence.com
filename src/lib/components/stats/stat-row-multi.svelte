<script lang="ts">
	import { number_crunch } from '#lib/utils/index.js';

	interface Props {
		label: string;
		visitors: number;
		views: number;
		max_value: number;
		href?: string;
	}

	let { label, visitors, views, max_value, href }: Props = $props();
</script>

<li class="relative flex items-center gap-2 py-1.5">
	<div
		class="absolute inset-y-0 left-0 rounded bg-primary/20"
		style="width: {(visitors / max_value) * 100}%"
	></div>
	<span class="relative min-w-0 flex-1 truncate text-sm">
		{#if href}
			<a {href} class="link capitalize link-hover">{label}</a>
		{:else}
			<span class="capitalize">{label}</span>
		{/if}
	</span>
	<span
		class="relative badge w-14 shrink-0 justify-end badge-ghost badge-sm whitespace-nowrap tabular-nums"
	>
		{number_crunch(visitors)}
	</span>
	<span
		class="relative badge w-14 shrink-0 justify-end badge-outline badge-sm whitespace-nowrap tabular-nums"
	>
		{number_crunch(views)}
	</span>
</li>
