<script lang="ts">
	import { get_live_stats_breakdown } from '#lib/analytics/live-analytics.remote.js';
	import { onMount } from 'svelte';
	import StatRow from './stat-row.svelte';

	const live_stats_query = get_live_stats_breakdown();

	onMount(() => {
		const interval = setInterval(() => {
			get_live_stats_breakdown().refresh().catch(console.error);
		}, 10000);
		return () => clearInterval(interval);
	});
</script>

<!-- Live visitors band -->
<section
	aria-label="Live visitors"
	class="rounded-box bg-primary p-4 text-primary-content sm:p-6"
>
	{#await live_stats_query}
		<div class="flex items-center justify-center py-4">
			<div class="loading loading-md loading-spinner"></div>
		</div>
	{:then live_stats}
		<div class="grid gap-x-2 gap-y-4 md:grid-cols-2">
			<div class="min-w-0">
				<div
					class="mb-1 flex justify-between px-2 text-xs opacity-80"
				>
					<span>Pages</span>
					<span>People</span>
				</div>
				{#if live_stats.top_paths.length > 0}
					{@const max_visitors = Math.max(
						...live_stats.top_paths
							.slice(0, 5)
							.map((p) => p.visitors),
					)}
					<ul>
						{#each live_stats.top_paths.slice(0, 5) as page (page.path)}
							<StatRow
								label={page.path}
								value={page.visitors}
								max_value={max_visitors}
								href={page.path}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 py-2 text-sm opacity-80">
						No one on the site right now
					</p>
				{/if}
			</div>

			<div class="min-w-0">
				<div
					class="mb-1 flex justify-between px-2 text-xs opacity-80"
				>
					<span>Referrers</span>
					<span>People</span>
				</div>
				{#if live_stats.referrers.length > 0}
					{@const max_visitors = Math.max(
						...live_stats.referrers
							.slice(0, 5)
							.map((r) => r.visitors),
					)}
					<ul>
						{#each live_stats.referrers.slice(0, 5) as r (r.referrer)}
							<StatRow
								label={r.referrer}
								value={r.visitors}
								max_value={max_visitors}
							/>
						{/each}
					</ul>
				{:else}
					<p class="px-2 py-2 text-sm opacity-80">No data yet</p>
				{/if}
			</div>
		</div>
	{/await}
</section>
