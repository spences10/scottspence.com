<script lang="ts">
	import { number_crunch } from '$lib/utils'

	interface Props {
		label: string
		value: number
		max_value: number
		href?: string
	}

	let { label, value, max_value, href }: Props = $props()
</script>

<li class="relative flex items-center justify-between gap-2 py-1.5">
	<div
		class="bg-primary/20 absolute inset-y-0 left-0 rounded"
		style="width: {(value / max_value) * 100}%"
	></div>
	<span class="relative min-w-0 flex-1 truncate text-sm">
		{#if href}
			<a {href} class="link-hover link capitalize">{label}</a>
		{:else}
			<span class="capitalize">{label}</span>
		{/if}
	</span>
	<span class="badge badge-ghost relative tabular-nums">
		{number_crunch(value)}
	</span>
</li>
