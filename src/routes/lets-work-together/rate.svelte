<script lang="ts">
	import { number_crunch } from '$lib/utils'
	import CurrencySelect from './currency-select.svelte'
	import { exchange_rates_store, get_field_value } from './stores'
	import {
		calculate_annual_rate_with_pto,
		calculate_day_rate_with_pto,
		calculate_monthly_rate_with_pto,
		locale_string,
	} from './utils'

	let annual_rate_EUR = $state(
		get_field_value('annual_rate_eur') || 0,
	)
	let chosen_holidays = $state(
		get_field_value('chosen_holidays') || 0,
	)
	let working_days_in_year =
		get_field_value('working_days_in_year') || 0
	let public_holidays = get_field_value('public_holidays') || 0
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
			: $exchange_rates_store[selected_currency],
	)

	const on_annual_rate_input = (e: Event) => {
		annual_rate_EUR = Math.max(
			(e.target as HTMLInputElement).valueAsNumber,
			get_field_value('annual_rate_eur') || 0,
		)
	}
</script>

<section class="flex flex-col">
	<fieldset>
		<legend class="sr-only">Rate Settings</legend>
		<label for="annual_rate" class="label">
			<span class="label-text text-base">
				Annual rate (EUR) {locale_string(annual_rate_EUR)}:
			</span>
		</label>
		<input
			id="annual_rate"
			type="range"
			min={120000}
			max={180000}
			step={5000}
			bind:value={annual_rate_EUR}
			oninput={on_annual_rate_input}
			class="range range-primary"
		/>
		<label for="pto_days" class="label">
			<span class="label-text text-base">
				PTO (days) {chosen_holidays}:
			</span>
		</label>
		<input
			id="pto_days"
			type="range"
			min={0}
			max={40}
			step={1}
			bind:value={chosen_holidays}
			class="range range-primary"
		/>

		<CurrencySelect bind:selected_currency />
	</fieldset>
</section>

<section
	class="stats stats-vertical mb-5 w-full border border-secondary shadow-lg md:stats-horizontal"
>
	<article class="stat">
		<div class="stat-title">Day</div>
		<div class="stat-value flex">
			{locale_string(day_rate_with_pto * currency_rate)}
			<span class="ml-2 text-xl">
				{selected_currency}
			</span>
		</div>
		<div class="stat-desc"></div>
	</article>

	<article class="stat">
		<div class="stat-title">Weekly</div>
		<div class="stat-value">
			<div
				class="tooltip flex"
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
				? `Base`
				: `Incl. ${(
						(chosen_holidays / working_days_in_year) *
						5
					).toFixed(2)} days PTO`}
		</div>
	</article>

	<article class="stat">
		<div class="stat-title">Monthly</div>
		<div class="stat-value">
			<div
				class="tooltip flex"
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
				? `Base`
				: `Incl. ${(chosen_holidays / 12).toFixed(1)} days PTO`}
		</div>
	</article>

	<article class="stat">
		<div class="stat-title">Annual</div>
		<div class="stat-value">
			<div
				class="tooltip flex"
				data-tip={locale_string(annual_rate_with_pto * currency_rate)}
			>
				{number_crunch(annual_rate_with_pto * currency_rate)}
				<span class="ml-2 text-xl">
					{selected_currency}
				</span>
			</div>
		</div>
		<div class="stat-desc">
			{chosen_holidays === 0
				? `Base`
				: `Incl. ${chosen_holidays} days PTO`}
		</div>
	</article>
</section>
