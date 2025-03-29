<script lang="ts">
	import CurrencySelect from './currency-select.svelte'
	import Select from './select.svelte'
	import { exchange_rates_store, get_field_value } from './stores'
	import { calculate_day_rate_with_pto, locale_string } from './utils'

	let annual_rate_EUR = get_field_value('annual_rate_eur') || 0
	let working_days_in_year =
		get_field_value('working_days_in_year') || 0

	const BLOG_POST_LENGTH = {
		Short: {
			description: '<1k words',
			cost:
				calculate_day_rate_with_pto(
					annual_rate_EUR,
					working_days_in_year,
				) * 1,
		},
		Medium: {
			description: '1k-2k words',
			cost:
				calculate_day_rate_with_pto(
					annual_rate_EUR,
					working_days_in_year,
				) * 2,
		},
		Long: {
			description: '>2k words',
			cost:
				calculate_day_rate_with_pto(
					annual_rate_EUR,
					working_days_in_year,
				) * 3,
		},
	}

	const BLOG_POST_DEPTH = {
		Overview: 0,
		'In-depth': 0.5, // 50% extra
		Series: 0.4, // 40% extra
	}

	let selected_post_length = $state(Object.keys(BLOG_POST_LENGTH)[0])
	let selected_post_depth = $state(Object.keys(BLOG_POST_DEPTH)[0])
	let selected_currency = $state('EUR')
	let selected_length_description = $state('Short')

	// function to calculate cost with depth
	const calculate_cost_with_depth = (
		base_cost: number,
		depth_percentage: number,
	) => base_cost * (1 + depth_percentage)

	$effect.pre(() => {
		selected_length_description =
			BLOG_POST_LENGTH[
				selected_post_length as keyof typeof BLOG_POST_LENGTH
			].description
	})

	let post_cost = $derived(
		BLOG_POST_LENGTH[
			selected_post_length as keyof typeof BLOG_POST_LENGTH
		].cost,
	)

	let post_cost_with_depth = $derived(
		calculate_cost_with_depth(
			post_cost,
			BLOG_POST_DEPTH[
				selected_post_depth as keyof typeof BLOG_POST_DEPTH
			],
		),
	)

	let currency_rate = $derived(
		selected_currency === 'EUR'
			? 1
			: $exchange_rates_store[selected_currency],
	)

	let post_cost_with_depth_in_selected_currency = $derived(
		post_cost_with_depth * currency_rate,
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

				<div class="mb-4">
					<CurrencySelect bind:selected_currency />
				</div>
			</fieldset>

			<div
				aria-label="Blog post stats"
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<div class="stat">
					<div class="stat-title font-medium">Length</div>
					<div class="stat-value text-primary flex items-center">
						{selected_length_description}
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
						{locale_string(post_cost_with_depth_in_selected_currency)}
						<span class="ml-2 text-xl">
							{selected_currency}
						</span>
					</div>
					<div class="stat-desc">Final price</div>
				</div>
			</div>
		</div>
	</div>
</div>
