<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import CurrencySelect from './currency-select.svelte'
	import Select from './select.svelte'
	import { locale_string } from './utils'

	const get_field_value = (field_name: string): number => {
		return (pricing_state.data.pricingNumbers as any)[field_name] || 0
	}

	let annual_rate_EUR = get_field_value('annual_rate_eur') || 120000
	let working_days_in_year =
		get_field_value('working_days_in_year') || 260

	let attendees = $state(5) // Minimum number of attendees
	let selected_currency = $state('EUR')
	let workshop_duration = $state('90 minutes')

	const BESPOKE_PERCENTAGES: Record<string, number> = {
		'90 minutes': 1.2,
		'Half day': 1.8,
		'Full day': 3.5,
		'Two days': 6.5,
		'Three days': 9,
	}

	const calculate_day_rate = (
		annual_rate: number,
		working_days: number,
	) => {
		return annual_rate / working_days
	}

	const calculate_workshop_cost = (
		annual_rate: number,
		working_days: number,
		attendees: number,
		workshop_duration: string,
	) => {
		let base_cost = calculate_day_rate(annual_rate, working_days)
		let discount_factor = 1 - Math.log(attendees) / 20
		return (
			base_cost *
			discount_factor *
			attendees *
			BESPOKE_PERCENTAGES[workshop_duration]
		)
	}

	let workshop_cost_EUR = $derived(
		calculate_workshop_cost(
			annual_rate_EUR,
			working_days_in_year,
			attendees,
			workshop_duration,
		),
	)
	let currency_rate = $derived(
		selected_currency === 'EUR'
			? 1
			: pricing_state.data.exchangeRates[
					selected_currency as keyof typeof pricing_state.data.exchangeRates
				],
	)
	let price_per_attendee = $derived(
		(workshop_cost_EUR * currency_rate) / attendees,
	)

	const on_attendees_input = (e: Event) => {
		attendees = Math.max(
			(e.target as HTMLInputElement).valueAsNumber,
			5,
		)
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-primary mb-4">Workshop Calculator</h2>

		<div class="grid gap-6">
			<fieldset class="grid gap-4">
				<legend class="sr-only">Workshop Configuration</legend>

				<div class="mb-4">
					<Select
						id="workshop_duration"
						label="Workshop Duration:"
						bind:selected={workshop_duration}
						options={Object.keys(BESPOKE_PERCENTAGES)}
					/>
				</div>

				<div class="mb-4">
					<label for="attendees" class="label">
						<span class="text-base font-medium">
							Number of Attendees: {attendees}
						</span>
					</label>
					<div class="flex items-center gap-4">
						<input
							id="attendees"
							type="range"
							min="1"
							max="20"
							bind:value={attendees}
							class="range range-primary flex-1"
							oninput={on_attendees_input}
						/>
						<span class="badge badge-primary badge-lg">
							{attendees}
						</span>
					</div>
				</div>

				<div class="mb-4">
					<CurrencySelect bind:selected_currency />
				</div>
			</fieldset>

			<div
				aria-label="Workshop Statistics"
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<div class="stat">
					<div class="stat-title font-medium">Attendees</div>
					<div class="stat-value text-primary flex items-center">
						{attendees}
					</div>
					<div class="stat-desc">Number of participants</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Price Per Attendee</div>
					<div class="stat-value text-secondary flex items-center">
						{locale_string(price_per_attendee)}
						<span class="ml-2 text-xl">
							{selected_currency}
						</span>
					</div>
					<div class="stat-desc">Cost per person</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Workshop Cost</div>
					<div class="stat-value text-accent flex items-center">
						{locale_string(workshop_cost_EUR * currency_rate)}
						<span class="ml-2 text-xl">
							{selected_currency}
						</span>
					</div>
					<div class="stat-desc">Total workshop price</div>
				</div>
			</div>

			<div class="alert alert-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="h-6 w-6 shrink-0 stroke-current"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path></svg
				>
				<span
					>Group discounts are automatically applied as the number of
					attendees increases.</span
				>
			</div>
		</div>
	</div>
</div>
