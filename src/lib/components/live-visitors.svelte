<script lang="ts">
	import { format_countries } from '$lib/analytics/analytics.helpers'
	import { get_active_visitors } from '$lib/analytics/analytics.remote'

	// Feature flag - disable until query optimization is complete
	const LIVE_VISITORS_ENABLED = false

	const data = LIVE_VISITORS_ENABLED
		? get_active_visitors({ limit: 10 })
		: null

	$effect(() => {
		if (!data) return
		const interval = setInterval(() => data.refresh(), 30_000)
		return () => clearInterval(interval)
	})
</script>

{#if LIVE_VISITORS_ENABLED && data}
	<svelte:boundary>
		{#snippet pending()}
			<span class="loading loading-spinner loading-xs"></span>
		{/snippet}

		{@const result = await data}
		{@const total = result.humans.total}
		{@const countries = result.humans.countries}

		{#if total > 0}
			<a
				href="/stats"
				class="text-base-content/70 hover:text-base-content flex items-center gap-1.5 text-sm transition"
				data-tip="View live stats"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
					></span>
					<span
						class="bg-success relative inline-flex h-2 w-2 rounded-full"
					></span>
				</span>
				<span>
					{total}
					{total === 1 ? 'person' : 'people'} on site
				</span>
				{#if countries.length > 0}
					<span class="opacity-70">
						{format_countries(countries)}
					</span>
				{/if}
			</a>
		{/if}
	</svelte:boundary>
{/if}
