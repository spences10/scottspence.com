<script lang="ts">
	import { get_active_visitors } from '$lib/analytics/analytics.remote'
	import { mouse_position } from '$lib/utils'

	const data = get_active_visitors({ limit: 10 })

	$effect(() => {
		const interval = setInterval(
			() => get_active_visitors({ limit: 10 }).refresh(),
			5000,
		)
		return () => clearInterval(interval)
	})
</script>

<div
	class="not-prose rounded-box border-primary bg-base-100 text-base-content fixed z-20 -translate-y-full border p-5 text-sm shadow-xl"
	style={`top: ${$mouse_position.y}px; left: ${$mouse_position.x}px;`}
>
	<h3 class="mb-2 text-xl font-bold">Current Site Visitors</h3>
	<svelte:boundary>
		{#snippet pending()}
			<p class="text-base-content/50">Loading...</p>
		{/snippet}

		{@const result = await data}
		<p class="mb-2 text-lg font-semibold">
			{result.total}
			{result.total === 1 ? 'visitor' : 'visitors'} active
		</p>
		{#if result.pages.length > 0}
			<section>
				<h4 class="mb-2 text-sm font-semibold opacity-70">
					Top pages:
				</h4>
				<ul class="mb-2 space-y-1">
					{#each result.pages as { path, count }}
						<li class="text-base-content">
							<span class="font-bold">{count}</span>
							<span class="opacity-70">{path}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</svelte:boundary>
</div>
