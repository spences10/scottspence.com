<script lang="ts">
	import { StatsCard } from '$lib/components'
	import { get_post_analytics } from '$lib/data/post-analytics.remote'

	let {
		slug,
		title,
		onclose,
	}: {
		slug: string
		title: string
		onclose: () => void
	} = $props()

	let modal_element = $state<HTMLDialogElement>()
	let analytics_data = $state<PostAnalytics | null>(null)
	let is_loading = $state(false)
	let error = $state<string | null>(null)

	export const show_modal = async () => {
		modal_element?.showModal()
		await fetch_analytics()
	}

	export const close_modal = () => {
		modal_element?.close()
	}

	const fetch_analytics = async () => {
		is_loading = true
		error = null
		try {
			analytics_data = await get_post_analytics(slug)
		} catch (err) {
			error = 'Failed to load analytics data'
			console.error('Error fetching analytics:', err)
		} finally {
			is_loading = false
		}
	}

	const handle_keydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === 'Space') {
			onclose()
		}
	}
</script>

<dialog
	class="modal modal-middle"
	bind:this={modal_element}
	{onclose}
>
	<div class="modal-box max-w-2xl">
		<div class="modal-content">
			{#if is_loading}
				<div class="flex justify-center p-8">
					<span class="loading loading-spinner loading-lg"></span>
				</div>
			{:else if error}
				<div class="alert alert-error">
					<span>{error}</span>
				</div>
			{:else if analytics_data}
				<h2 class="mb-4 text-2xl font-bold">Stats for {title}</h2>
				<StatsCard
					daily_visits={analytics_data.daily}
					monthly_visits={analytics_data.monthly}
					yearly_visits={analytics_data.yearly}
				/>
			{:else}
				<p>No analytics data available for this post.</p>
			{/if}
		</div>
	</div>
	<button
		type="button"
		class="modal-backdrop"
		onclick={onclose}
		onkeydown={handle_keydown}
		aria-label="Close modal"
	></button>
</dialog>

<style>
	.modal-middle {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-box {
		position: relative;
		margin: auto;
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.3);
		border: none;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}
</style>
