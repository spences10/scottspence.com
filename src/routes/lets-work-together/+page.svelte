<script lang="ts">
	import { TableOfContents } from '$lib/components'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import { pricing_state } from '$lib/state/pricing-client.svelte'
	import {
		get_headings,
		og_image_url,
		update_toc_visibility,
	} from '$lib/utils'
	import { Head } from 'svead'
	import { onMount } from 'svelte'

	interface Props {
		data: any
	}

	let { data }: Props = $props()
	let { Copy, exchange_rates, pricing_numbers } = data

	// Initialize client-side state with server data
	pricing_state.init({
		exchangeRates: exchange_rates,
		pricingNumbers: pricing_numbers || {
			posts_per_week: 1,
			years_programming: 10,
			total_posts: 100,
			average_reading_time: 5,
			annual_rate_eur: 120000,
			chosen_holidays: 25,
			working_days_in_year: 260,
			public_holidays: 8,
		},
	})

	let end_of_copy = $state<HTMLElement | null>(null)
	let show_table_of_contents = $state(true)
	let headings_promise = $state<
		Promise<{ label: string; href: string }[]> | undefined
	>(undefined)

	onMount(() => {
		headings_promise = get_headings()
	})

	const handle_scroll = () => {
		show_table_of_contents = update_toc_visibility(end_of_copy)
	}

	const seo_config = create_seo_config({
		title: `Let's work together! - ${name}`,
		description: `Want to work with me? Here's a breakdown of what I can do for you.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`Let's work together!`,
		),
		url: `${website}/lets-work-together`,
		slug: 'lets-work-together',
	})
</script>

<svelte:window onscroll={handle_scroll} />

<Head {seo_config} />

{#if headings_promise}
	{#await headings_promise}
		<p>Loading table of contents...</p>
	{:then headings}
		{#if show_table_of_contents && headings.length > 0}
			<TableOfContents {headings} />
		{/if}
	{:catch error}
		<p>Error loading table of contents: {error.message}</p>
	{/await}
{/if}

<div class="all-prose mb-10">
	<Copy />
</div>

<div class="mt-10 mb-5 flex w-full flex-col" bind:this={end_of_copy}>
	<div class="divider divider-secondary"></div>
</div>
