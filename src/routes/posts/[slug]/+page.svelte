<script lang="ts">
	import { goto, preloadData, pushState } from '$app/navigation'
	import { page } from '$app/state'
	import {
		differenceInDays,
		differenceInYears,
		format,
	} from 'date-fns'
	import * as Fathom from 'fathom-client'
	import { Head, SchemaOrg } from 'svead'

	import {
		ButtButt,
		CurrentVisitorsData,
		IsPrivateBanner,
		PopularPosts,
		PostOnBlueSky,
		Reactions,
		RelatedPosts,
		TableOfContents,
		TextSelectionPopup,
		UpdatedBanner,
	} from '$lib/components'
	import {
		create_schema_org_config,
		create_seo_config,
	} from '$lib/seo'
	import { get_headings, update_toc_visibility } from '$lib/utils'
	import StatsPage from '../../stats/[slug]/+page.svelte'
	import Modal from './modal.svelte'

	import { website } from '$lib/info'
	import type { VisitorEntry } from '$lib/stores'

	import { getReactionCounts } from './reactions.remote'
	import { get_related_posts } from './related.remote'

	let { data } = $props()

	let { Content, meta } = data

	// Load related posts and reactions using remote functions
	let relatedPostsQuery = get_related_posts(meta.slug)
	let reactionCountsQuery = getReactionCounts(page.url.pathname)

	const {
		title,
		date,
		updated,
		preview,
		slug,
		is_private,
		tags,
		reading_time,
	} = meta

	const url = `${website}/posts/${slug}`
	const seo_config = create_seo_config({
		title,
		description: preview.slice(0, 140) + '...',
		slug: `posts/${slug}`,
	})

	const blog_posting = create_schema_org_config({
		'@type': 'BlogPosting',
		'@id': url,
		url: url,
		headline: title,
		name: title,
		description: preview,
		datePublished: format(new Date(date), "yyyy-MM-dd'T'HH:mm:ssxxx"),
		dateModified: updated
			? format(new Date(updated), "yyyy-MM-dd'T'HH:mm:ssxxx")
			: format(new Date(date), "yyyy-MM-dd'T'HH:mm:ssxxx"),
		image: seo_config.open_graph_image,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': website,
		},
	})

	const breadcrumb_items = [
		{ name: 'Home', item: website },
		{ name: 'Posts', item: `${website}/posts` },
		{ name: title, item: url },
	]

	const breadcrumb_list = {
		'@type': 'BreadcrumbList',
		'@id': `${url}#breadcrumb`,
		name: 'Breadcrumb',
		itemListElement: breadcrumb_items.map((breadcrumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: breadcrumb.name,
			item: breadcrumb.item,
		})),
	}

	const schema_org_config = {
		'@context': 'https://schema.org',
		'@graph': [blog_posting, breadcrumb_list],
	}

	let path = page.route.id

	let end_of_copy = $state<HTMLElement | null>(null)
	let show_table_of_contents = $state(true)
	let headings_promise = $state<
		Promise<{ label: string; href: string }[]> | undefined
	>(undefined)

	$effect(() => {
		headings_promise = get_headings().then((headings) => {
			return headings
		})
	})

	let current_path = page.url.pathname

	let current_visitor_data: VisitorEntry | undefined

	// TODO: Fix this shit
	// $: {
	//   if ($visitors_store && $visitors_store.visitor_data) {
	//     current_visitor_data = $visitors_store.visitor_data.find(
	//       visitor => visitor.pathname === slug,
	//     )
	//   }
	// }

	const handle_scroll = () => {
		show_table_of_contents = update_toc_visibility(end_of_copy, -200)
	}

	let selection_popup = $state({
		visible: false,
		selectedText: '',
		x: 0,
		y: 0,
	})

	const text_selection_handler = (element: HTMLElement) => {
		const handle_mouse_up = () => {
			setTimeout(() => {
				const selection = window.getSelection()
				if (selection && selection.toString().trim().length > 0) {
					const range = selection.getRangeAt(0)
					const rect = range.getBoundingClientRect()

					selection_popup = {
						visible: true,
						selectedText: selection.toString(),
						x: rect.left + rect.width / 2 + window.scrollX,
						y: rect.bottom + window.scrollY + 10,
					}
				} else {
					selection_popup = {
						...selection_popup,
						visible: false,
					}
				}
			}, 10)
		}

		const handle_global_click = (event: MouseEvent) => {
			// Hide popup if clicking outside the content area and there's no selection
			if (!element.contains(event.target as Node)) {
				const selection = window.getSelection()
				if (!selection || selection.toString().trim().length === 0) {
					selection_popup = {
						...selection_popup,
						visible: false,
					}
				}
			}
		}

		element.addEventListener('mouseup', handle_mouse_up)
		document.addEventListener('click', handle_global_click)

		return () => {
			element.removeEventListener('mouseup', handle_mouse_up)
			document.removeEventListener('click', handle_global_click)
		}
	}

	let show_current_visitor_data = $state(false)
	let modal = $state() as HTMLDialogElement

	const show_modal = async (
		e: MouseEvent & { currentTarget: HTMLAnchorElement },
	) => {
		if (e.metaKey || e.ctrlKey) return
		e.preventDefault()

		// Track the event with Fathom
		Fathom.trackEvent(`analytics click: ${current_path}`)

		// get URL
		const { href } = e.currentTarget as HTMLAnchorElement

		// get result of `load` function
		const result = await preloadData(href)

		// create new history entry
		if (result.type === 'loaded' && result.status === 200) {
			// Serialize the data
			const serialized_data = JSON.parse(JSON.stringify(result.data))
			pushState(href, { selected: serialized_data })
			modal.showModal()
		} else {
			goto(href)
		}
	}

	const close_modal = () => {
		history.back()
		modal.close()
	}
</script>

<svelte:window onscroll={handle_scroll} />

<Head {seo_config} />
<SchemaOrg schema={schema_org_config} />

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

<article>
	<h1 class="mb-1 text-5xl font-black">{title}</h1>
	<div class="mt-4 mb-3 uppercase">
		<div class="mb-1">
			<time datetime={new Date(date).toISOString()}>
				{format(new Date(date), 'MMMM d, yyyy')}
			</time>
			&bull;
			<span>{reading_time.text}</span>
		</div>
		<div>
			{#each tags as tag}
				<a href={`/tags/${tag}`}>
					<span
						class="badge badge-sm badge-primary text-primary-content hover:bg-accent hover:text-accetn-content mr-2 shadow-md transition"
					>
						{tag}
					</span>
				</a>
			{/each}
			{#if differenceInDays(new Date(), new Date(date)) < 31}
				<span
					class="badge badge-sm badge-secondary text-secondary-content hover:bg-accent hover:text-accent-content cursor-pointer font-bold shadow-md transition"
				>
					new
				</span>
			{/if}
		</div>
	</div>
	{#if current_visitor_data}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			onmouseenter={() => (show_current_visitor_data = true)}
			onmouseleave={() => (show_current_visitor_data = false)}
			class="inline-block cursor-pointer text-sm"
		>
			<p>
				{current_visitor_data.recent_visitors}
				{current_visitor_data.recent_visitors > 1
					? `people`
					: `person`} viewing this page live
			</p>
			{#if show_current_visitor_data}
				<CurrentVisitorsData />
			{/if}
			<p class="text-sm">
				Read to the end of the post for more stats
			</p>
		</span>
	{/if}

	{#if is_private}
		<IsPrivateBanner />
	{/if}

	{#if differenceInYears(new Date(), new Date(date)) >= 1 || updated}
		<UpdatedBanner
			updated={updated === undefined ? date : updated}
			{date}
		/>
	{/if}

	<div class="all-prose mb-10" {@attach text_selection_handler}>
		<Content />
	</div>

	<div
		class="mt-10 mb-5 flex w-full flex-col"
		bind:this={end_of_copy}
	>
		<div class="divider divider-secondary"></div>
	</div>

	{#if !is_private}
		{#if reactionCountsQuery.error}
			<Reactions data={{ count: {} }} path={current_path} />
		{:else if reactionCountsQuery.pending}
			<div class="loading loading-spinner loading-lg mx-auto"></div>
		{:else if reactionCountsQuery.current}
			<Reactions
				data={{
					count: reactionCountsQuery.current.reduce(
						(acc, r) => ({ ...acc, [r.reaction_type]: r.count }),
						{},
					),
				}}
				path={current_path}
			/>
		{:else}
			<Reactions data={{ count: {} }} path={current_path} />
		{/if}
	{/if}

	<div class="mb-24 grid justify-items-center">
		<PostOnBlueSky
			post_text={`Check out this post from @scottspence.dev, ${title}: ${url}`}
			button_text="Useful? Share it on Bluesky."
			button_class="btn-secondary"
		/>
	</div>

	<div class="flex justify-center">
		<a
			onclick={show_modal}
			href="/stats/{page.params.slug}"
			class="btn btn-primary btn-lg mb-20 px-10 text-xl shadow-lg"
		>
			✨ View the stats for this post ✨
		</a>
	</div>

	<Modal bind:modal onclose={close_modal}>
		{#if page.state.selected}
			<StatsPage data={page.state.selected} />
		{/if}
	</Modal>

	<PopularPosts />

	{#if relatedPostsQuery.error}
		<div class="alert alert-error">
			<p>
				Error loading related posts: {relatedPostsQuery.error.message}
			</p>
		</div>
	{:else if relatedPostsQuery.pending}
		<div class="loading loading-spinner loading-lg mx-auto"></div>
	{:else if relatedPostsQuery.current && relatedPostsQuery.current.length > 0}
		<RelatedPosts related_posts={relatedPostsQuery.current} />
	{/if}

	<ButtButt />
</article>

<TextSelectionPopup
	selected_text={selection_popup.selectedText}
	post_title={title}
	post_url={url}
	x={selection_popup.x}
	y={selection_popup.y}
	visible={selection_popup.visible}
/>
