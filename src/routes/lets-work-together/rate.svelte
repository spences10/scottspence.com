<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import { number_crunch } from '$lib/utils'
	import CurrencySelect from './currency-select.svelte'
	import { locale_string } from './utils'

	let day_rate_display = $derived(
		pricing_state.day_rate * pricing_state.currency_rate,
	)
	let weekly_display = $derived(
		pricing_state.weekly_rate * pricing_state.currency_rate,
	)
	let monthly_display = $derived(
		pricing_state.monthly_rate * pricing_state.currency_rate,
	)
	let annual_display = $derived(
		pricing_state.annual_rate * pricing_state.currency_rate,
	)
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body">
		<h2 class="card-title text-primary mb-4">Rate Calculator</h2>

		<div class="grid gap-6">
			<fieldset class="grid gap-4">
				<legend class="sr-only">Rate Settings</legend>

				<div class="mb-4">
					<CurrencySelect />
				</div>

				{#if pricing_state.is_gbp}
					<div class="mb-4">
						<label for="ir35_toggle" class="label">
							<span class="text-base font-medium">
								IR35 Status:
							</span>
						</label>
						<div class="flex items-center gap-3">
							<span
								class="text-sm font-medium"
								class:text-primary={!pricing_state.ir35_inside}
							>
								Outside
							</span>
							<input
								id="ir35_toggle"
								type="checkbox"
								bind:checked={pricing_state.ir35_inside}
								class="toggle toggle-primary"
							/>
							<span
								class="text-sm font-medium"
								class:text-primary={pricing_state.ir35_inside}
							>
								Inside
							</span>
						</div>
						<p class="text-base-content/60 mt-1 text-xs">
							{#if pricing_state.ir35_inside}
								Inside IR35: {pricing_state.data.pricing_config
									.ir35_uplift_pct}% uplift applied to cover
								employer's NI and tax obligations
							{:else}
								Outside IR35: standard contractor rate via limited
								company
							{/if}
						</p>
					</div>
				{/if}

				<div class="mb-4">
					<label for="pto_days" class="label">
						<span class="text-base font-medium">
							PTO (days): {pricing_state.pto_days}
						</span>
					</label>
					<div class="flex items-center gap-4">
						<input
							id="pto_days"
							type="range"
							min={0}
							max={40}
							step={1}
							bind:value={pricing_state.pto_days}
							class="range range-primary flex-1"
						/>
						<span class="badge badge-primary badge-lg">
							{pricing_state.pto_days}
						</span>
					</div>
				</div>
			</fieldset>

			<div
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<article class="stat">
					<div class="stat-title font-medium">Day Rate</div>
					<div class="stat-value text-primary flex items-center">
						{locale_string(day_rate_display)}
						<span class="ml-2 text-xl">
							{pricing_state.selected_currency}
						</span>
					</div>
					<div class="stat-desc">
						{#if pricing_state.is_gbp}
							{pricing_state.ir35_inside
								? 'Inside IR35'
								: 'Outside IR35'}
						{/if}
					</div>
				</article>

				<article class="stat">
					<div class="stat-title font-medium">Weekly</div>
					<div class="stat-value text-secondary">
						<div
							class="tooltip flex items-center"
							data-tip={locale_string(weekly_display)}
						>
							{number_crunch(weekly_display)}
							<span class="ml-2 text-xl">
								{pricing_state.selected_currency}
							</span>
						</div>
					</div>
					<div class="stat-desc">
						{pricing_state.pto_days === 0
							? `Base rate`
							: `Incl. ${(
									(pricing_state.pto_days /
										pricing_state.data.pricing_config
											.working_days_in_year) *
									5
								).toFixed(2)} days PTO`}
					</div>
				</article>

				<article class="stat">
					<div class="stat-title font-medium">Monthly</div>
					<div class="stat-value text-accent">
						<div
							class="tooltip flex items-center"
							data-tip={locale_string(monthly_display)}
						>
							{number_crunch(monthly_display)}
							<span class="ml-2 text-xl">
								{pricing_state.selected_currency}
							</span>
						</div>
					</div>
					<div class="stat-desc">
						{pricing_state.pto_days === 0
							? `Base rate`
							: `Incl. ${(pricing_state.pto_days / 12).toFixed(1)} days PTO`}
					</div>
				</article>

				<article class="stat">
					<div class="stat-title font-medium">Annual</div>
					<div class="stat-value">
						<div
							class="tooltip flex items-center"
							data-tip={locale_string(annual_display)}
						>
							{number_crunch(annual_display)}
							<span class="ml-2 text-xl">
								{pricing_state.selected_currency}
							</span>
						</div>
					</div>
					<div class="stat-desc">
						{pricing_state.pto_days === 0
							? `Base rate`
							: `Incl. ${pricing_state.pto_days} days PTO`}
					</div>
				</article>
			</div>

			{#if pricing_state.is_gbp}
				<div
					class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
				>
					<article class="stat">
						<div class="stat-title font-medium">
							Contractor Take-home
						</div>
						<div class="stat-value text-primary flex items-center">
							{number_crunch(pricing_state.contractor_take_home)}
							<span class="ml-2 text-xl">GBP</span>
						</div>
						<div class="stat-desc">
							Via Ltd company (salary + dividends)
						</div>
					</article>

					<article class="stat">
						<div class="stat-title font-medium">
							Equivalent Salary
						</div>
						<div class="stat-value text-secondary flex items-center">
							{number_crunch(pricing_state.salary_equivalent)}
							<span class="ml-2 text-xl">GBP</span>
						</div>
						<div class="stat-desc">
							Permanent salary for same take-home
						</div>
					</article>
				</div>
			{/if}
		</div>
	</div>
</div>
