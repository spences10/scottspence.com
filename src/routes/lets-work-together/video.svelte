<script lang="ts">
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import Select from './select.svelte'
	import { locale_string } from './utils'

	const VIDEO_DURATION = {
		Short: { description: '5-10 min', multiplier: 1.5 },
		Medium: { description: '10-20 min', multiplier: 2.5 },
		Long: { description: '20-30 min', multiplier: 3.6 },
		'Extra Long': { description: '>30 min', multiplier: 4.8 },
	}

	const VIDEO_CUSTOMISATION = {
		None: 0,
		Minor: 0.3,
		Moderate: 0.5,
		Major: 1.1,
	}

	let selected_video_duration = $state(Object.keys(VIDEO_DURATION)[0])
	let selected_customisation = $state(
		Object.keys(VIDEO_CUSTOMISATION)[0],
	)

	let duration_config = $derived(
		VIDEO_DURATION[
			selected_video_duration as keyof typeof VIDEO_DURATION
		],
	)

	let customisation_pct = $derived(
		VIDEO_CUSTOMISATION[
			selected_customisation as keyof typeof VIDEO_CUSTOMISATION
		],
	)

	let total_cost = $derived(
		pricing_state.day_rate *
			duration_config.multiplier *
			(1 + customisation_pct) *
			pricing_state.currency_rate,
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
						options={Object.keys(VIDEO_DURATION)}
					/>
				</div>

				<div class="mb-4">
					<Select
						id="customisation_level"
						label="Customisation level:"
						bind:selected={selected_customisation}
						options={Object.keys(VIDEO_CUSTOMISATION)}
					/>
				</div>
			</fieldset>

			<div
				class="stats stats-vertical border-base-300 bg-base-100 md:stats-horizontal w-full border shadow"
			>
				<div class="stat">
					<div class="stat-title font-medium">Length</div>
					<div class="stat-value text-primary flex items-center">
						{duration_config.description}
					</div>
					<div class="stat-desc">Video duration</div>
				</div>

				<div class="stat">
					<div class="stat-title font-medium">Customisation</div>
					<div class="stat-value text-secondary flex items-center">
						{selected_customisation}
					</div>
					<div class="stat-desc">
						{#if selected_customisation === 'None'}
							Standard format
						{:else if selected_customisation === 'Minor'}
							Light customisation (+30%)
						{:else if selected_customisation === 'Moderate'}
							Medium customisation (+50%)
						{:else}
							Heavy customisation (+110%)
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
