<script lang="ts">
	import { format_countries } from '$lib/analytics/analytics.helpers'
	import { get_active_visitors } from '$lib/analytics/analytics.remote'

	const data = get_active_visitors({ limit: 10 })

	$effect(() => {
		const interval = setInterval(() => data.refresh(), 5_000)
		return () => clearInterval(interval)
	})
</script>

<svelte:boundary>
	{#snippet pending()}
		<span class="loading loading-spinner loading-xs"></span>
	{/snippet}

	{@const result = await data}
	{@const total = result.humans.total}
	{@const countries = result.humans.countries}

	{#if total > 0}
		<div
			class="text-base-content/70 flex items-center gap-1.5 text-sm"
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
		</div>
	{/if}
</svelte:boundary>
