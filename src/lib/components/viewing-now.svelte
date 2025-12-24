<script lang="ts">
	import { page } from '$app/state'
	import { get_active_on_path } from '$lib/analytics/analytics.remote'

	let path = $derived(page.url.pathname)
	let data = $derived(get_active_on_path({ path }))

	$effect(() => {
		const interval = setInterval(() => data.refresh(), 5_000)
		return () => clearInterval(interval)
	})
</script>

<svelte:boundary>
	{@const result = await data}
	{#if result.count > 0}
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
			{result.count}
			{result.count === 1 ? 'person' : 'people'} viewing now
		</div>
	{/if}
</svelte:boundary>
