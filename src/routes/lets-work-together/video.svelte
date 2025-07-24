<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import CurrencySelect from './currency-select.svelte'
	import Select from './select.svelte'
	import { calculate_day_rate_with_pto, locale_string } from './utils'

	const get_field_value = (field_name: string): number => {
		return (
			pricing_state.data.pricingNumbers[
				field_name as keyof typeof pricing_state.data.pricingNumbers
			] || 0
		)
	}

	let annual_rate_EUR = get_field_value('annual_rate_eur') || 120000
	let working_days_in_year =
		get_field_value('working_days_in_year') || 260

	const calculate_cost_with_customisation = (
		base_cost: number,
		customisation_percentage: number,
	) => base_cost * (1 + customisation_percentage)

	const calculate_cost = (multiplier: number) =>
		calculate_day_rate_with_pto(
			annual_rate_EUR,
			working_days_in_year,
		) * multiplier

	const VIDEO_DURATION = {
		Short: { description: '5-10 min', cost: calculate_cost(1.5) },
		Medium: { description: '10-20 min', cost: calculate_cost(2.5) },
		Long: { description: '20-30 min', cost: calculate_cost(3.6) },
		'Extra Long': {
			description: '>30 min',
			cost: calculate_cost(4.8),
		},
	}

	const VIDEO_CUSTOMISATION_PERCENTAGES = {
		None: 0,
		Minor: 0.3, // 30% extra
		Moderate: 0.5, // 50% extra
		Major: 1.1, // 110% extra
	}

	const VIDEO_DURATION_OPTIONS = Object.keys(VIDEO_DURATION)
	const CUSTOMISATION_LEVEL_OPTIONS = Object.keys(
		VIDEO_CUSTOMISATION_PERCENTAGES,
	)

	let selected_video_duration = $state(VIDEO_DURATION_OPTIONS[0])
	let selected_customisation_level = $state(
		CUSTOMISATION_LEVEL_OPTIONS[0],
	)
	let selected_currency = $state('EUR')
	let selected_duration: string | undefined = $state()

	$effect.pre(() => {
		selected_duration =
			VIDEO_DURATION[
				selected_video_duration as keyof typeof VIDEO_DURATION
			].description
	})
	let video_cost = $derived(
		VIDEO_DURATION[
			selected_video_duration as keyof typeof VIDEO_DURATION
		].cost,
	)
	let video_cost_with_customisation = $derived(
		calculate_cost_with_customisation(
			video_cost,
			VIDEO_CUSTOMISATION_PERCENTAGES[
				selected_customisation_level as keyof typeof VIDEO_CUSTOMISATION_PERCENTAGES
			],
		),
	)

	let currency_rate = $derived(
		selected_currency === 'EUR'
			? 1
			: pricing_state.data.exchangeRates[
					selected_currency as keyof typeof pricing_state.data.exchangeRates
				],
	)

	let video_cost_with_customisation_in_selected_currency = $derived(
		video_cost_with_customisation * currency_rate,
	)
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-primary mb-4">
			Video Production Calculator
		</h2>

		<div class="grid gap-6">
			<fieldset class="grid gap-4">
				<legend class="sr-only">Video Configuration</legend>

				<div class="mb-4">
					<Select
						id="duration"
						label="Video duration:"
						bind:selected={selected_video_duration}
						options={VIDEO_DURATION_OPTIONS}
					/>
				</div>

				<div class="mb-4">
					<Select
						id="customisation_level"
						label="Customisation level:"
						bind:selected={selected_customisation_level}
						options={CUSTOMISATION_LEVEL_OPTIONS}
					/>
				</div>

				<div class="mb-4">
					<CurrencySelect bind:selected_currency />
				</div>
			</fieldset>

			<div
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<div class="stat">
					<div class="stat-title font-medium">Length</div>
					<div class="stat-value text-primary flex items-center">
						{selected_duration}
					</div>
					<div class="stat-desc">Video duration</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Customisation</div>
					<div class="stat-value text-secondary flex items-center">
						{selected_customisation_level}
					</div>
					<div class="stat-desc">
						{#if selected_customisation_level === 'None'}
							Standard format
						{:else if selected_customisation_level === 'Minor'}
							Light customisation (+30%)
						{:else if selected_customisation_level === 'Moderate'}
							Medium customisation (+50%)
						{:else}
							Heavy customisation (+110%)
						{/if}
					</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Total</div>
					<div class="stat-value text-accent flex items-center">
						{locale_string(
							video_cost_with_customisation_in_selected_currency,
						)}
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
