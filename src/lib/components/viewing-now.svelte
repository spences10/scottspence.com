<script lang="ts">
	import { get_live_state } from '$lib/analytics/live-analytics.svelte'

	// path prop kept for API compatibility but we use shared state
	let { path: _ }: { path: string } = $props()

	const state = get_live_state()
</script>

{#if state.path_viewers > 0}
	<div class="flex items-center gap-2">
		<div class="inline-grid *:[grid-area:1/1]">
			<div
				class="status status-primary animate-ping [animation-duration:2s]"
			></div>
			<div class="status status-primary"></div>
		</div>
		<a href="/stats" class="link link-primary text-sm tracking-wide">
			<span class="text-sm">
				{state.path_viewers}
				{state.path_viewers === 1 ? 'person' : 'people'} viewing now
			</span>
		</a>
	</div>
{/if}
