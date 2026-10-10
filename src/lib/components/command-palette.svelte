<script lang="ts">
	import { Document, News, Tag } from '#lib/icons/index.js';
	import {
		command_palette_state,
		type SearchItem,
	} from '#lib/state/command-palette.svelte.js';
	import { goto } from '$app/navigation';

	const scroll_selected_into_view = () => {
		const selected_el = command_palette_state.dialog?.querySelector(
			`[data-index="${command_palette_state.selected_index}"]`,
		);
		selected_el?.scrollIntoView({ block: 'nearest' });
	};

	const handle_keydown = (event: KeyboardEvent) => {
		const { flat_items, selected_index } = command_palette_state;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			command_palette_state.selected_index = Math.min(
				selected_index + 1,
				flat_items.length - 1,
			);
			scroll_selected_into_view();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			command_palette_state.selected_index = Math.max(
				selected_index - 1,
				0,
			);
			scroll_selected_into_view();
		} else if (event.key === 'Enter' && flat_items[selected_index]) {
			event.preventDefault();
			navigate_to(flat_items[selected_index]);
		}
	};

	const navigate_to = (item: SearchItem) => {
		command_palette_state.add_recent(item.href);
		command_palette_state.close();
		goto(item.href);
	};

	const handle_close = () => {
		command_palette_state.close();
	};
</script>

<!-- offset is where the group starts in the flat keyboard navigation list -->
{#snippet result_group(
	label: string,
	items: SearchItem[],
	offset: number,
)}
	{#if items.length > 0}
		<div
			class="mt-2 px-3 py-2 text-xs font-semibold text-base-content/50 uppercase first:mt-0"
		>
			{label}
		</div>
		<ul role="listbox" aria-label={label}>
			{#each items as item, index (item.href)}
				{@const flat_index = offset + index}
				{@const selected =
					flat_index === command_palette_state.selected_index}
				<li
					role="option"
					aria-selected={selected}
					data-index={flat_index}
				>
					<button
						class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-base-200 {selected
							? 'bg-base-200'
							: ''}"
						onclick={() => navigate_to(item)}
					>
						<span class="text-base-content/50">
							{#if item.type === 'post'}
								<News height="20" width="20" classes="text-primary" />
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
						<div class="flex-1 overflow-hidden">
							<div class="truncate font-medium">{item.title}</div>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<dialog
	class="modal modal-middle p-4"
	{@attach command_palette_state.register}
	onclose={handle_close}
	aria-label="Search"
>
	<article
		class="modal-box flex h-auto max-h-[75dvh] w-full max-w-xl flex-col rounded-box p-0 sm:max-h-[80vh] lg:max-w-3xl"
	>
		<search class="border-b border-base-300 p-4">
			<label for="command-palette-search" class="sr-only">
				Search posts, tags, and pages
			</label>
			<input
				id="command-palette-search"
				{@attach command_palette_state.register_input}
				bind:value={
					() => command_palette_state.query,
					command_palette_state.set_query
				}
				onkeydown={handle_keydown}
				type="search"
				placeholder="Search posts, tags, pages..."
				class="input w-full input-ghost text-lg focus:outline-none"
			/>
		</search>

		<nav
			class="flex-1 overflow-y-auto p-2 sm:max-h-[60vh]"
			aria-label="Search results"
		>
			{#if command_palette_state.query.trim() === '' && command_palette_state.recent.length > 0}
				{@render result_group(
					'Recent',
					command_palette_state.flat_items,
					0,
				)}
			{:else if command_palette_state.query.trim() !== ''}
				{@const { posts, tags, pages, related } =
					command_palette_state.grouped_items}
				{@render result_group('Posts', posts, 0)}
				{@render result_group('Tags', tags, posts.length)}
				{@render result_group(
					'Pages',
					pages,
					posts.length + tags.length,
				)}
				{@render result_group(
					'Related posts',
					related,
					posts.length + tags.length + pages.length,
				)}

				<div role="status">
					{#if command_palette_state.searching && related.length === 0}
						<div class="p-4 text-center text-base-content/50">
							Finding related posts...
						</div>
					{:else if command_palette_state.flat_items.length === 0}
						<div class="p-4 text-center text-base-content/50">
							No results found
						</div>
					{/if}
				</div>
			{:else if command_palette_state.loading}
				<div
					class="flex items-center justify-center gap-2 p-4 text-base-content/50"
				>
					<span class="loading loading-sm loading-spinner"></span>
					Loading...
				</div>
			{:else}
				<div class="p-4 text-center text-base-content/50">
					Start typing to search...
				</div>
			{/if}
		</nav>

		<footer
			class="flex gap-4 border-t border-base-300 p-3 text-xs text-base-content/50"
		>
			<span><kbd class="kbd kbd-xs">↑↓</kbd> navigate</span>
			<span><kbd class="kbd kbd-xs">↵</kbd> select</span>
			<span><kbd class="kbd kbd-xs">esc</kbd> close</span>
		</footer>
	</article>
	<button class="modal-backdrop" onclick={handle_close}>close</button>
</dialog>
