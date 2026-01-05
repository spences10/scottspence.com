<script lang="ts">
	import { page } from '$app/state'
	import { track_click } from '$lib/analytics/track-click.remote'
	import {
		differenceInDays,
		differenceInYears,
		format,
	} from 'date-fns'
	import { Head, SchemaOrg } from 'svead'

	import {
		ButtButt,
		IsPrivateBanner,
		NewsletterSignup,
		PopularPosts,
		PostOnBlueSky,
		Reactions,
		RelatedPosts,
		TableOfContents,
		TextSelectionPopup,
		UpdatedBanner,
		ViewingNow,
	} from '$lib/components'
	import {
		create_schema_org_config,
		create_seo_config,
	} from '$lib/seo'
	import { get_headings, update_toc_visibility } from '$lib/utils'
	import Modal from './modal.svelte'

	import { website } from '$lib/info'

	let { data } = $props()

	// Direct property access maintains reactivity
	const url = $derived(`${website}/posts/${data.meta.slug}`)
	const seo_config = $derived(
		create_seo_config({
			title: data.meta.title,
			description: data.meta.preview.slice(0, 140) + '...',
			slug: `posts/${data.meta.slug}`,
		}),
	)

	const blog_posting = $derived(
		create_schema_org_config({
			'@type': 'BlogPosting',
			'@id': url,
			url: url,
			headline: data.meta.title,
			name: data.meta.title,
			description: data.meta.preview,
			datePublished: format(
				new Date(data.meta.date),
				"yyyy-MM-dd'T'HH:mm:ssxxx",
			),
			dateModified: data.meta.updated
				? format(
						new Date(data.meta.updated),
						"yyyy-MM-dd'T'HH:mm:ssxxx",
					)
				: format(
						new Date(data.meta.date),
						"yyyy-MM-dd'T'HH:mm:ssxxx",
					),
			image: seo_config.open_graph_image,
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': website,
			},
		}),
	)

	const breadcrumb_items = $derived([
		{ name: 'Home', item: website },
		{ name: 'Posts', item: `${website}/posts` },
		{ name: data.meta.title, item: url },
	])

	const breadcrumb_list = $derived({
		'@type': 'BreadcrumbList',
		'@id': `${url}#breadcrumb`,
		name: 'Breadcrumb',
		itemListElement: breadcrumb_items.map((breadcrumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: breadcrumb.name,
			item: breadcrumb.item,
		})),
	})

	const schema_org_config = $derived({
		'@context': 'https://schema.org',
		'@graph': [blog_posting, breadcrumb_list],
	})

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

	let modal = $state() as typeof Modal.prototype

	const show_modal = async (
		e: MouseEvent & { currentTarget: HTMLAnchorElement },
	) => {
		if (e.metaKey || e.ctrlKey) return
		e.preventDefault()

		// Track the event
		track_click({
			event_name: `analytics click: ${page.url.pathname}`,
		})

		// Open modal and fetch analytics data
		await modal.show_modal()
	}

	const close_modal = () => {
		modal.close_modal()
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
	<h1 class="mb-1 text-5xl font-black">{data.meta.title}</h1>
	<div class="mt-4 mb-3 uppercase">
		<div class="mb-1">
			<time datetime={new Date(data.meta.date).toISOString()}>
				{format(new Date(data.meta.date), 'MMMM d, yyyy')}
			</time>
			&bull;
			<span>{data.meta.reading_time.text}</span>
		</div>
		<div>
			{#each data.meta.tags as tag}
				<a href={`/tags/${tag}`}>
					<span
						class="badge badge-sm badge-primary text-primary-content hover:bg-accent hover:text-accetn-content mr-2 shadow-md transition"
					>
						{tag}
					</span>
				</a>
			{/each}
			{#if differenceInDays(new Date(), new Date(data.meta.date)) < 31}
				<span
					class="badge badge-sm badge-secondary text-secondary-content hover:bg-accent hover:text-accent-content cursor-pointer font-bold shadow-md transition"
				>
					new
				</span>
			{/if}
		</div>
	</div>
	<ViewingNow path={page.url.pathname} />

	{#if data.meta.is_private}
		<IsPrivateBanner />
	{/if}

	{#if differenceInYears(new Date(), new Date(data.meta.date)) >= 1 || data.meta.updated}
		<UpdatedBanner
			updated={data.meta.updated === undefined
				? data.meta.date
				: data.meta.updated}
			date={data.meta.date}
		/>
	{/if}

	<div class="all-prose mb-10" {@attach text_selection_handler}>
		<data.Content />
	</div>

	<div
		class="mt-10 mb-5 flex w-full flex-col"
		bind:this={end_of_copy}
	>
		<div class="divider divider-secondary"></div>
	</div>

	{#if !data.meta.is_private && data.count && data.count.count}
		<Reactions data={data.count} path={page.url.pathname} />
	{/if}

	<div class="mb-24 grid justify-items-center">
		<PostOnBlueSky
			post_text={`Check out this post from @scottspence.dev, ${data.meta.title}: ${url}`}
			button_text="Useful? Share it on Bluesky."
			button_class="btn-secondary"
		/>
	</div>

	{#if data.count && data.count.count}
		<div class="flex justify-center">
			<a
				onclick={show_modal}
				href="/stats/{page.params.slug}"
				class="btn btn-primary btn-lg mb-20 px-10 text-xl shadow-lg"
			>
				✨ View the stats for this post ✨
			</a>
		</div>
	{/if}

	<Modal
		bind:this={modal}
		slug={data.meta.slug}
		title={data.meta.title}
		onclose={close_modal}
	/>

	<PopularPosts />

	<RelatedPosts related_posts={data.related_posts} />

	<ButtButt />

	<NewsletterSignup />

	<div class="mb-24"></div>
</article>

<TextSelectionPopup
	selected_text={selection_popup.selectedText}
	post_title={data.meta.title}
	post_url={url}
	x={selection_popup.x}
	y={selection_popup.y}
	visible={selection_popup.visible}
/>
