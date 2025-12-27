<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import { number_crunch } from '$lib/utils'
	import CurrencySelect from './currency-select.svelte'
	import {
		calculate_annual_rate_with_pto,
		calculate_day_rate_with_pto,
		calculate_monthly_rate_with_pto,
		locale_string,
	} from './utils'

	const get_field_value = (field_name: string): number => {
		return (
			pricing_state.data.pricingNumbers[
				field_name as keyof typeof pricing_state.data.pricingNumbers
			] || 0
		)
	}

	let annual_rate_EUR = $state(
		get_field_value('annual_rate_eur') || 120000,
	)
	let chosen_holidays = $state(
		get_field_value('chosen_holidays') || 25,
	)
	let working_days_in_year =
		get_field_value('working_days_in_year') || 260
	let public_holidays = get_field_value('public_holidays') || 8
	let selected_currency = $state('EUR')

	let day_rate_with_pto = $derived(
		calculate_day_rate_with_pto(
			annual_rate_EUR || 0,
			working_days_in_year,
			chosen_holidays,
			public_holidays,
		),
	)

	let monthly_rate_with_pto = $derived(
		calculate_monthly_rate_with_pto(
			annual_rate_EUR || 0,
			working_days_in_year,
			chosen_holidays,
			public_holidays,
		),
	)

	let annual_rate_with_pto = $derived(
		calculate_annual_rate_with_pto(
			annual_rate_EUR || 0,
			working_days_in_year,
			chosen_holidays,
			public_holidays,
		),
	)

	let currency_rate = $derived(
		selected_currency === 'EUR'
			? 1
			: pricing_state.data.exchangeRates[
					selected_currency as keyof typeof pricing_state.data.exchangeRates
				],
	)

	const on_annual_rate_input = (e: Event) => {
		annual_rate_EUR = Math.max(
			(e.target as HTMLInputElement).valueAsNumber,
			get_field_value('annual_rate_eur') || 120000,
		)
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-primary mb-4">Rate Calculator</h2>

		<div class="grid gap-6">
			<fieldset class="grid gap-4">
				<legend class="sr-only">Rate Settings</legend>

				<div class="mb-4">
					<label for="annual_rate" class="label">
						<span class="text-base font-medium">
							Annual rate (EUR): {locale_string(annual_rate_EUR)}
						</span>
					</label>
					<div class="flex items-center gap-4">
						<input
							id="annual_rate"
							type="range"
							min={120000}
							max={180000}
							step={5000}
							bind:value={annual_rate_EUR}
							oninput={on_annual_rate_input}
							class="range range-primary flex-1"
						/>
						<span class="badge badge-primary badge-lg">
							{locale_string(annual_rate_EUR)}
						</span>
					</div>
				</div>

				<div class="mb-4">
					<label for="pto_days" class="label">
						<span class="text-base font-medium">
							PTO (days): {chosen_holidays}
						</span>
					</label>
					<div class="flex items-center gap-4">
						<input
							id="pto_days"
							type="range"
							min={0}
							max={40}
							step={1}
							bind:value={chosen_holidays}
							class="range range-primary flex-1"
						/>
						<span class="badge badge-primary badge-lg"
							>{chosen_holidays}</span
						>
					</div>
				</div>

				<div class="mb-4">
					<CurrencySelect bind:selected_currency />
				</div>
			</fieldset>

			<div
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<article class="stat">
					<div class="stat-title font-medium">Day Rate</div>
					<div class="stat-value text-primary flex items-center">
						{locale_string(day_rate_with_pto * currency_rate)}
						<span class="ml-2 text-xl">
							{selected_currency}
						</span>
					</div>
					<div class="stat-desc"></div>
				</article>

				<article class="stat">
					<div class="stat-title font-medium">Weekly</div>
					<div class="stat-value text-secondary">
						<div
							class="tooltip flex items-center"
							data-tip={locale_string(
								day_rate_with_pto * 5 * currency_rate,
							)}
						>
							{number_crunch(day_rate_with_pto * 5 * currency_rate)}
							<span class="ml-2 text-xl">
								{selected_currency}
							</span>
						</div>
					</div>
					<div class="stat-desc">
						{chosen_holidays === 0
							? `Base rate`
							: `Incl. ${(
									(chosen_holidays / working_days_in_year) *
									5
								).toFixed(2)} days PTO`}
					</div>
				</article>

				<article class="stat">
					<div class="stat-title font-medium">Monthly</div>
					<div class="stat-value text-accent">
						<div
							class="tooltip flex items-center"
							data-tip={locale_string(
								monthly_rate_with_pto * currency_rate,
							)}
						>
							{number_crunch(monthly_rate_with_pto * currency_rate)}
							<span class="ml-2 text-xl">
								{selected_currency}
							</span>
						</div>
					</div>
					<div class="stat-desc">
						{chosen_holidays === 0
							? `Base rate`
							: `Incl. ${(chosen_holidays / 12).toFixed(1)} days PTO`}
					</div>
				</article>

				<article class="stat">
					<div class="stat-title font-medium">Annual</div>
					<div class="stat-value">
						<div
							class="tooltip flex items-center"
							data-tip={locale_string(
								annual_rate_with_pto * currency_rate,
							)}
						>
							{number_crunch(annual_rate_with_pto * currency_rate)}
							<span class="ml-2 text-xl">
								{selected_currency}
							</span>
						</div>
					</div>
					<div class="stat-desc">
						{chosen_holidays === 0
							? `Base rate`
							: `Incl. ${chosen_holidays} days PTO`}
					</div>
				</article>
			</div>
		</div>
	</div>
</div>
