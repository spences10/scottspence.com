<script lang="ts">
	// Client-side cache duration (30 seconds)
	const ACTIVE_VIEWERS_CACHE_DURATION = 30 * 1000
	import { get_active_viewers } from '$lib/data/active-viewers.remote'
	import { Eye } from '$lib/icons'
	import {
		get_page_data,
		is_page_loading,
		set_page_data,
		set_page_loading,
		should_fetch_page_data,
	} from '$lib/state/active-viewers.svelte'
	import { onMount } from 'svelte'

	interface Props {
		page_slug?: string
		show_icon?: boolean
		class_name?: string
	}

	let {
		page_slug = '',
		show_icon = true,
		class_name = '',
	}: Props = $props()

	// Reactive data from universal state
	let viewer_data = $derived(
		page_slug ? get_page_data(page_slug) : null,
	)
	let loading = $derived(
		page_slug ? is_page_loading(page_slug) : false,
	)

	const load_viewer_count = async () => {
		if (!page_slug) return

		// Check if we need to fetch (using client-side cache check)
		if (
			!should_fetch_page_data(
				page_slug,
				ACTIVE_VIEWERS_CACHE_DURATION,
			)
		) {
			return
		}

		set_page_loading(page_slug, true)

		try {
			const data = await get_active_viewers(page_slug)
			set_page_data(page_slug, data)
		} catch (error) {
			console.warn('Failed to load active viewers:', error)
			set_page_data(page_slug, {
				count: 0,
				page_slug,
				error: 'Failed to load viewer count',
			})
		} finally {
			set_page_loading(page_slug, false)
		}
	}

	onMount(() => {
		load_viewer_count()

		// Refresh every 30 seconds for near real-time updates
		const interval = setInterval(load_viewer_count, 30000)

		return () => clearInterval(interval)
	})
</script>

{#if viewer_data && viewer_data.count > 0}
	<div
		class="text-base-content/70 flex items-center gap-2 text-sm {class_name}"
	>
		{#if show_icon}
			<Eye height="16" width="16" />
		{/if}
		<span>
			{viewer_data.count === 1
				? '1 person'
				: `${viewer_data.count} people`} reading now
		</span>
	</div>
{:else if loading}
	<div
		class="text-base-content/50 flex items-center gap-2 text-sm {class_name}"
	>
		{#if show_icon}
			<div
				class="bg-base-content/20 h-4 w-4 animate-pulse rounded"
			></div>
		{/if}
		<span>Loading...</span>
	</div>
{/if}
