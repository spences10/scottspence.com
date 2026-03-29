<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import Select from './select.svelte'
	import { locale_string } from './utils'

	const WORKSHOP_DURATION: Record<string, number> = {
		'90 minutes': 1.2,
		'Half day': 1.8,
		'Full day': 3.5,
		'Two days': 6.5,
		'Three days': 9,
	}

	let attendees = $state(5)
	let workshop_duration = $state('90 minutes')

	let workshop_cost = $derived.by(() => {
		const base = pricing_state.day_rate
		const discount_factor = 1 - Math.log(attendees) / 20
		return (
			base *
			discount_factor *
			attendees *
			WORKSHOP_DURATION[workshop_duration]
		)
	})

	let total_display = $derived(
		workshop_cost * pricing_state.currency_rate,
	)
	let per_attendee_display = $derived(total_display / attendees)

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
						options={Object.keys(WORKSHOP_DURATION)}
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
						{locale_string(per_attendee_display)}
						<span class="ml-2 text-xl">
							{pricing_state.selected_currency}
						</span>
					</div>
					<div class="stat-desc">Cost per person</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Workshop Cost</div>
					<div class="stat-value text-accent flex items-center">
						{locale_string(total_display)}
						<span class="ml-2 text-xl">
							{pricing_state.selected_currency}
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
				<span>
					Group discounts are automatically applied as the number of
					attendees increases.
				</span>
			</div>
		</div>
	</div>
</div>
