<script lang="ts">
	import { get_live_analytics } from '$lib/analytics/live-analytics.remote'

	const data = get_live_analytics()

	// Refresh every 5 seconds
	$effect(() => {
		const interval = setInterval(
			() => get_live_analytics().refresh(),
			5000,
		)
		return () => clearInterval(interval)
	})
</script>

<svelte:boundary>
	{#snippet pending()}
		<span class="opacity-50">...</span>
	{/snippet}

	{@const result = await data}
	{#if result.unique_visitors > 0}
	<div class="inline-grid *:[grid-area:1/1]">
		<div class="status status-primary animate-ping"></div>
		<div class="status status-primary"></div>
	</div>
		<a href="/stats" class="link link-primary text-sm tracking-wide">
			There's currently
			<span class="font-bold">
				{result.unique_visitors}
			</span>
			live {result.unique_visitors === 1 ? 'visitor' : 'visitors'}
		</a>
	{/if}
</svelte:boundary>
