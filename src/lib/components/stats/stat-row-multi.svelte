<script lang="ts">
	import { number_crunch } from '$lib/utils'

	interface Props {
		label: string
		visitors: number
		views: number
		max_value: number
		href?: string
	}

	let { label, visitors, views, max_value, href }: Props = $props()
</script>

<li class="relative flex items-center gap-2 py-1.5">
	<div
		class="bg-primary/20 absolute inset-y-0 left-0 rounded"
		style="width: {(visitors / max_value) * 100}%"
	></div>
	<span class="relative min-w-0 flex-1 truncate text-sm">
		{#if href}
			<a {href} class="link-hover link capitalize">{label}</a>
		{:else}
			<span class="capitalize">{label}</span>
		{/if}
	</span>
	<span
		class="badge badge-ghost badge-sm relative w-14 justify-end tabular-nums"
	>
		{number_crunch(visitors)}
	</span>
	<span
		class="badge badge-outline badge-sm relative w-14 justify-end tabular-nums"
	>
		{number_crunch(views)}
	</span>
</li>
