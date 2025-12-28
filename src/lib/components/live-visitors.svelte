<script lang="ts">
	import { get_live_state } from '$lib/analytics/live-analytics.svelte'

	const state = get_live_state()
</script>

{#if state.unique_visitors > 0}
	<div class="flex items-center gap-2">
		<div class="inline-grid *:[grid-area:1/1]">
			<div
				class="status status-primary animate-ping [animation-duration:2s]"
			></div>
			<div class="status status-primary"></div>
		</div>
		<a href="/stats" class="link link-primary text-sm tracking-wide">
			There's currently
			<span class="font-bold">
				{state.unique_visitors}
			</span>
			live {state.unique_visitors === 1 ? 'visitor' : 'visitors'}
		</a>
	</div>
{/if}
