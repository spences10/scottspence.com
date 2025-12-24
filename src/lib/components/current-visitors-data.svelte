<script lang="ts">
	import { format_countries } from '$lib/analytics/analytics.helpers'
	import { get_active_visitors } from '$lib/analytics/analytics.remote'
	import { mouse_position } from '$lib/utils'

	const data = get_active_visitors({ limit: 10 })

	$effect(() => {
		const interval = setInterval(() => data.refresh(), 5_000)
		return () => clearInterval(interval)
	})

	const device_emoji = (device: string) => {
		if (device === 'mobile') return '📱'
		if (device === 'tablet') return '📟'
		return '🖥️'
	}
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
			{#if result.bots > 0}
				<span class="text-sm font-normal opacity-50">
					(+{result.bots} 🤖)
				</span>
			{/if}
		</p>

		{#if result.countries.length > 0}
			<p class="mb-2 text-base opacity-80">
				{format_countries(result.countries)}
			</p>
		{/if}

		<div class="mb-3 flex flex-wrap gap-3 text-xs opacity-70">
			{#if result.devices.length > 0}
				<span>
					{#each result.devices as { name, count }}
						{count}{device_emoji(name)}
					{/each}
				</span>
			{/if}
			{#if result.browsers.length > 0}
				<span>
					{result.browsers
						.map((b) => `${b.count} ${b.name}`)
						.join(', ')}
				</span>
			{/if}
		</div>

		{#if result.referrers.length > 0}
			<section class="mb-3">
				<h4 class="mb-1 text-xs font-semibold opacity-70">
					Referrers:
				</h4>
				<ul class="space-y-0.5 text-xs">
					{#each result.referrers as { name, count }}
						<li>
							<span class="font-bold">{count}</span>
							<span class="opacity-70">{name}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if result.pages.length > 0}
			<section>
				<h4 class="mb-1 text-xs font-semibold opacity-70">
					Top pages:
				</h4>
				<ul class="space-y-0.5 text-xs">
					{#each result.pages as { path, count }}
						<li>
							<span class="font-bold">{count}</span>
							<span class="opacity-70">{path}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</svelte:boundary>
</div>
