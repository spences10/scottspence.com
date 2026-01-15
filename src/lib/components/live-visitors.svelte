<script lang="ts">
	import { get_live_state } from '$lib/analytics/live-analytics.svelte'

	interface Props {
		mode?: 'site' | 'page'
	}

	let { mode = 'site' }: Props = $props()

	const state = get_live_state()

	const count = $derived(
		mode === 'site' ? state.unique_visitors : state.path_viewers,
	)
	const text = $derived(
		mode === 'site'
			? `live ${count === 1 ? 'visitor' : 'visitors'}`
			: `${count === 1 ? 'person' : 'people'} viewing now`,
	)
</script>

{#if count > 0}
	<div class="flex items-center gap-2">
		<div class="inline-grid *:[grid-area:1/1]">
			<div
				class="status status-primary animate-ping [animation-duration:2s]"
			></div>
			<div class="status status-primary"></div>
		</div>
		<a href="/stats" class="link link-primary text-sm tracking-wide">
			{#if mode === 'site'}
				There's currently
				<span class="font-bold tabular-nums">{count}</span>
				{text}
			{:else}
				<span class="text-sm">{count} {text}</span>
			{/if}
		</a>
	</div>
{/if}
