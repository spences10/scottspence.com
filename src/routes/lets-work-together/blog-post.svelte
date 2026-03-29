<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import Select from './select.svelte'
	import { locale_string } from './utils'

	const BLOG_POST_LENGTH = {
		Short: { description: '<1k words', multiplier: 1 },
		Medium: { description: '1k-2k words', multiplier: 2 },
		Long: { description: '>2k words', multiplier: 3 },
	}

	const BLOG_POST_DEPTH = {
		Overview: 0,
		'In-depth': 0.5,
		Series: 0.4,
	}

	let selected_post_length = $state(Object.keys(BLOG_POST_LENGTH)[0])
	let selected_post_depth = $state(Object.keys(BLOG_POST_DEPTH)[0])

	let selected_length_config = $derived(
		BLOG_POST_LENGTH[
			selected_post_length as keyof typeof BLOG_POST_LENGTH
		],
	)

	let depth_multiplier = $derived(
		BLOG_POST_DEPTH[
			selected_post_depth as keyof typeof BLOG_POST_DEPTH
		],
	)

	let total_cost = $derived(
		pricing_state.day_rate *
			selected_length_config.multiplier *
			(1 + depth_multiplier) *
			pricing_state.currency_rate,
	)
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-primary mb-4">Blog Post Calculator</h2>

		<div class="grid gap-6">
			<fieldset class="grid gap-4">
				<legend class="sr-only">Blog Post Configuration</legend>

				<div class="mb-4">
					<Select
						id="post_duration"
						label="Blog Post Length:"
						bind:selected={selected_post_length}
						options={Object.keys(BLOG_POST_LENGTH)}
					/>
				</div>

				<div class="mb-4">
					<Select
						id="post_depth"
						label="Blog Post Depth:"
						bind:selected={selected_post_depth}
						options={Object.keys(BLOG_POST_DEPTH)}
					/>
				</div>
			</fieldset>

			<div
				aria-label="Blog post stats"
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<div class="stat">
					<div class="stat-title font-medium">Length</div>
					<div class="stat-value text-primary flex items-center">
						{selected_length_config.description}
					</div>
					<div class="stat-desc">Word count range</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Depth</div>
					<div class="stat-value text-secondary flex items-center">
						{selected_post_depth}
					</div>
					<div class="stat-desc">
						{#if selected_post_depth === 'Overview'}
							Basic coverage
						{:else if selected_post_depth === 'In-depth'}
							Detailed analysis (+50%)
						{:else}
							Multiple connected posts (+40%)
						{/if}
					</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Total</div>
					<div class="stat-value text-accent flex items-center">
						{locale_string(total_cost)}
						<span class="ml-2 text-xl">
							{pricing_state.selected_currency}
						</span>
					</div>
					<div class="stat-desc">Final price</div>
				</div>
			</div>
		</div>
	</div>
</div>
