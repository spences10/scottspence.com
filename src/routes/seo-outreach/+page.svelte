<script lang="ts">
	import { TableOfContents } from '$lib/components'
	import { name, website } from '$lib/info'
	import { create_seo_config } from '$lib/seo'
	import {
		get_headings,
		og_image_url,
		update_toc_visibility,
	} from '$lib/utils'
	import { Head } from 'svead'

	let { data } = $props()
	let { Copy } = data

	let end_of_copy = $state<HTMLElement | null>(null)
	let show_table_of_contents = $state(true)
	let headings_promise = $state<
		Promise<{ label: string; href: string }[]> | undefined
	>(undefined)

	$effect(() => {
		headings_promise = get_headings()
	})

	const handle_scroll = () => {
		show_table_of_contents = update_toc_visibility(end_of_copy)
	}

	const seo_config = create_seo_config({
		title: `SEO Outreach - ${name}`,
		description: `Information for SEO outreach specialists and link requests.`,
		open_graph_image: og_image_url(
			name,
			`scottspence.com`,
			`SEO Outreach`,
		),
		url: `${website}/seo-outreach`,
		slug: 'seo-outreach',
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
