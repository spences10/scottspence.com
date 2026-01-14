<script lang="ts">
	import { goto } from '$app/navigation'
	import { get_post_tags } from '$lib/data/post-tags.remote'
	import { get_posts } from '$lib/data/posts.remote'
	import { Document, News, Tag } from '$lib/icons'
	import { NAV_LINKS, SITE_LINKS } from '$lib/info'
	import { command_palette_state } from '$lib/state/command-palette.svelte'
	import { tick } from 'svelte'

	let posts = $state<Post[]>([])
	let tags = $state<string[]>([])
	let loaded = $state(false)
	let loading = $state(false)

	let dialog_element = $state<HTMLDialogElement>()
	let input_element = $state<HTMLInputElement>()
	let selected_index = $state(0)

	// Lazy load data when palette opens
	$effect(() => {
		if (command_palette_state.is_open && !loaded && !loading) {
			loading = true
			Promise.all([get_posts(), get_post_tags()])
				.then(([fetched_posts, { tags: fetched_tags }]) => {
					posts = fetched_posts
					tags = fetched_tags
					loaded = true
				})
				.finally(() => {
					loading = false
				})
		}
	})

	type SearchItem = {
		type: 'post' | 'tag' | 'page'
		title: string
		href: string
		preview?: string
	}

	const all_pages: SearchItem[] = [
		...NAV_LINKS.map((l) => ({
			type: 'page' as const,
			title: l.title,
			href: `/${l.slug}`,
		})),
		...SITE_LINKS.map((l) => ({
			type: 'page' as const,
			title: l.title,
			href: `/${l.slug}`,
		})),
	]

	let all_items = $derived<SearchItem[]>([
		...posts
			.filter((p) => !p.is_private)
			.map((p) => ({
				type: 'post' as const,
				title: p.title,
				href: `/posts/${p.slug}`,
				preview: p.preview,
			})),
		...tags.map((t) => ({
			type: 'tag' as const,
			title: t,
			href: `/tags/${t}`,
		})),
		...all_pages,
	])

	let filtered_items = $derived.by(() => {
		const q = command_palette_state.query.toLowerCase().trim()
		if (!q) {
			// Show recent if available, otherwise show sample of each type
			if (command_palette_state.recent.length > 0) {
				return command_palette_state.recent
					.map((href) => all_items.find((i) => i.href === href))
					.filter((i): i is SearchItem => i !== undefined)
			}
			return []
		}
		return all_items.filter(
			(item) =>
				item.title.toLowerCase().includes(q) ||
				item.preview?.toLowerCase().includes(q),
		)
	})

	// Group items by type
	let grouped_items = $derived.by(() => {
		const posts_group = filtered_items.filter(
			(i) => i.type === 'post',
		)
		const tags_group = filtered_items.filter((i) => i.type === 'tag')
		const pages_group = filtered_items.filter(
			(i) => i.type === 'page',
		)
		return {
			posts: posts_group,
			tags: tags_group,
			pages: pages_group,
		}
	})

	// Flat list for keyboard navigation
	let flat_items = $derived([
		...grouped_items.posts,
		...grouped_items.tags,
		...grouped_items.pages,
	])

	// Reset selection when query changes
	$effect(() => {
		// Track query explicitly - reset index on change
		const _query = command_palette_state.query
		selected_index = 0
	})

	// Sync dialog with state
	$effect(() => {
		const open = command_palette_state.is_open
		if (open) {
			dialog_element?.showModal()
			tick().then(() => input_element?.focus())
		} else {
			dialog_element?.close()
		}
	})

	const scroll_selected_into_view = () => {
		const selected_el = dialog_element?.querySelector(
			`[data-index="${selected_index}"]`,
		)
		selected_el?.scrollIntoView({ block: 'nearest' })
	}

	const handle_keydown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			selected_index = Math.min(
				selected_index + 1,
				flat_items.length - 1,
			)
			scroll_selected_into_view()
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			selected_index = Math.max(selected_index - 1, 0)
			scroll_selected_into_view()
		} else if (event.key === 'Enter' && flat_items[selected_index]) {
			event.preventDefault()
			navigate_to(flat_items[selected_index])
		}
	}

	const navigate_to = (item: SearchItem) => {
		command_palette_state.add_recent(item.href)
		command_palette_state.close()
		goto(item.href)
	}

	const handle_close = () => {
		command_palette_state.close()
	}

	const get_flat_index = (
		type: 'post' | 'tag' | 'page',
		index: number,
	) => {
		if (type === 'post') return index
		if (type === 'tag') return grouped_items.posts.length + index
		return (
			grouped_items.posts.length + grouped_items.tags.length + index
		)
	}
</script>

<dialog
	class="modal modal-bottom sm:modal-middle p-4 sm:p-6"
	bind:this={dialog_element}
	onclose={handle_close}
	onclick={(e) => {
		if (e.target === dialog_element) handle_close()
	}}
	aria-label="Search"
>
	<article
		class="modal-box rounded-box flex h-auto max-h-[65vh] w-full max-w-xl flex-col p-0 sm:max-h-[80vh]"
	>
		<search class="border-base-300 border-b p-4">
			<label for="command-palette-search" class="sr-only">
				Search posts, tags, and pages
			</label>
			<input
				id="command-palette-search"
				bind:this={input_element}
				bind:value={command_palette_state.query}
				onkeydown={handle_keydown}
				type="search"
				placeholder="Search posts, tags, pages..."
				class="input input-ghost w-full text-lg focus:outline-none"
			/>
		</search>

		<nav
			class="flex-1 overflow-y-auto p-2 sm:max-h-[60vh]"
			aria-label="Search results"
		>
			{#if command_palette_state.query.trim() === '' && command_palette_state.recent.length > 0}
				<div
					class="text-base-content/50 px-3 py-2 text-xs font-semibold uppercase"
				>
					Recent
				</div>
				<ul role="listbox">
					{#each flat_items as item, index (item.href)}
						<li
							role="option"
							aria-selected={index === selected_index}
							data-index={index}
						>
							<button
								class="hover:bg-base-200 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors {index ===
								selected_index
									? 'bg-base-200'
									: ''}"
								onclick={() => navigate_to(item)}
							>
								<span class="text-base-content/50">
									{#if item.type === 'post'}
										<News
											height="20"
											width="20"
											classes="text-primary"
										/>
									{:else if item.type === 'tag'}
										<Tag
											height="20"
											width="20"
											classes="text-secondary"
										/>
									{:else}
										<Document
											height="20"
											width="20"
											classes="text-accent"
										/>
									{/if}
								</span>
								<div class="flex-1">
									<div class="font-medium">{item.title}</div>
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{:else if command_palette_state.query.trim() !== ''}
				{#if grouped_items.posts.length > 0}
					<div
						class="text-base-content/50 px-3 py-2 text-xs font-semibold uppercase"
					>
						Posts
					</div>
					<ul role="listbox">
						{#each grouped_items.posts as item, index (item.href)}
							{@const flat_index = get_flat_index('post', index)}
							<li
								role="option"
								aria-selected={flat_index === selected_index}
								data-index={flat_index}
							>
								<button
									class="hover:bg-base-200 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors {flat_index ===
									selected_index
										? 'bg-base-200'
										: ''}"
									onclick={() => navigate_to(item)}
								>
									<span class="text-base-content/50">
										<News
											height="20"
											width="20"
											classes="text-primary"
										/>
									</span>
									<div class="flex-1 overflow-hidden">
										<div class="truncate font-medium">
											{item.title}
										</div>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				{#if grouped_items.tags.length > 0}
					<div
						class="text-base-content/50 mt-2 px-3 py-2 text-xs font-semibold uppercase"
					>
						Tags
					</div>
					<ul role="listbox">
						{#each grouped_items.tags as item, index (item.href)}
							{@const flat_index = get_flat_index('tag', index)}
							<li
								role="option"
								aria-selected={flat_index === selected_index}
								data-index={flat_index}
							>
								<button
									class="hover:bg-base-200 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors {flat_index ===
									selected_index
										? 'bg-base-200'
										: ''}"
									onclick={() => navigate_to(item)}
								>
									<span class="text-base-content/50">
										<Tag
											height="20"
											width="20"
											classes="text-secondary"
										/>
									</span>
									<div class="flex-1">
										<div class="font-medium">{item.title}</div>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				{#if grouped_items.pages.length > 0}
					<div
						class="text-base-content/50 mt-2 px-3 py-2 text-xs font-semibold uppercase"
					>
						Pages
					</div>
					<ul role="listbox">
						{#each grouped_items.pages as item, index (item.href)}
							{@const flat_index = get_flat_index('page', index)}
							<li
								role="option"
								aria-selected={flat_index === selected_index}
								data-index={flat_index}
							>
								<button
									class="hover:bg-base-200 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors {flat_index ===
									selected_index
										? 'bg-base-200'
										: ''}"
									onclick={() => navigate_to(item)}
								>
									<span class="text-base-content/50">
										<Document
											height="20"
											width="20"
											classes="text-accent"
										/>
									</span>
									<div class="flex-1">
										<div class="font-medium">{item.title}</div>
									</div>
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				{#if flat_items.length === 0}
					<div class="text-base-content/50 p-4 text-center">
						No results found
					</div>
				{/if}
			{:else if loading}
				<div
					class="text-base-content/50 flex items-center justify-center gap-2 p-4"
				>
					<span class="loading loading-spinner loading-sm"></span>
					Loading...
				</div>
			{:else}
				<div class="text-base-content/50 p-4 text-center">
					Start typing to search...
				</div>
			{/if}
		</nav>

		<footer
			class="border-base-300 text-base-content/50 flex gap-4 border-t p-3 text-xs"
		>
			<span><kbd class="kbd kbd-xs">↑↓</kbd> navigate</span>
			<span><kbd class="kbd kbd-xs">↵</kbd> select</span>
			<span><kbd class="kbd kbd-xs">esc</kbd> close</span>
		</footer>
	</article>
	<button class="modal-backdrop" onclick={handle_close}>close</button>
</dialog>
