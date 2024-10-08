<script lang="ts">
  import CurrencySelect from './currency-select.svelte'
  import Select from './select.svelte'
  import { exchange_rates_store, get_field_value } from './stores'
  import { locale_string } from './utils'

  let annual_rate_EUR = get_field_value('annual_rate_eur') || 0
  let working_days_in_year =
    get_field_value('working_days_in_year') || 0

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
      : $exchange_rates_store[selected_currency],
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

<section aria-label="Workshop Configuration">
  <fieldset>
    <Select
      id="workshop_duration"
      label="Workshop Duration:"
      bind:selected={workshop_duration}
      options={Object.keys(BESPOKE_PERCENTAGES)}
    />

    <legend class="sr-only">Number of Attendees</legend>
    <label for="attendees" class="label">
      <span class="label-text text-base">
        Number of Attendees: {attendees}
      </span>
    </label>
    <input
      id="attendees"
      type="range"
      min="1"
      max="20"
      bind:value={attendees}
      class="range range-primary"
      oninput={on_attendees_input}
    />

    <CurrencySelect bind:selected_currency />
  </fieldset>

  <section
    aria-label="Workshop Statistics"
    class="stats stats-vertical mb-5 w-full border border-secondary shadow-lg md:stats-horizontal"
  >
    <div class="stat">
      <div class="stat-title">Attendees</div>
      <div class="stat-value flex">
        {attendees}
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Price Per Attendee</div>
      <div class="stat-value flex">
        {locale_string(price_per_attendee)}
        <span class="ml-2 text-xl">
          {selected_currency}
        </span>
      </div>
    </div>

    <div class="stat">
      <div class="stat-title">Workshop Cost</div>
      <div class="stat-value flex">
        {locale_string(workshop_cost_EUR * currency_rate)}
        <span class="ml-2 text-xl">
          {selected_currency}
        </span>
      </div>
    </div>
  </section>
</section>
