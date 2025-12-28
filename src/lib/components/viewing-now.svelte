<script lang="ts">
	import { get_viewing_now } from '$lib/analytics/live-analytics.remote'

	let { path }: { path: string } = $props()

	let data = $derived(get_viewing_now({ path }))

	// Refresh every 5 seconds
	$effect(() => {
		const interval = setInterval(() => data.refresh(), 5000)
		return () => clearInterval(interval)
	})
</script>

<svelte:boundary>
	{#snippet pending()}
		<span class="text-sm opacity-50">...</span>
	{/snippet}

	{@const result = await data}
	{#if result.viewers > 0}
		<div class="inline-grid *:[grid-area:1/1]">
			<div class="status status-primary animate-ping"></div>
			<div class="status status-primary"></div>
		</div>
		<span class="text-sm">
			{result.viewers}
			{result.viewers === 1 ? 'person' : 'people'} viewing now
		</span>
	{/if}
</svelte:boundary>
