import { get_post_tags } from '#lib/data/post-tags.remote.js';
import { get_posts } from '#lib/data/posts.remote.js';
import { search_posts } from '#lib/data/search-posts.remote.js';
import { NAV_LINKS, SITE_LINKS } from '#lib/info.js';

export type SearchItem = {
	type: 'post' | 'tag' | 'page';
	title: string;
	href: string;
	preview?: string;
};

const MIN_RELATED_QUERY_LENGTH = 3;
const RELATED_DEBOUNCE_MS = 300;

const all_pages: SearchItem[] = [...NAV_LINKS, ...SITE_LINKS].map(
	(l) => ({
		type: 'page' as const,
		title: l.title,
		href: `/${l.slug}`,
	}),
);

class CommandPaletteState {
	dialog: HTMLDialogElement | null = null;
	input: HTMLInputElement | null = null;
	query = $state('');
	recent = $state<string[]>([]);
	is_open = $state(false);
	has_opened = $state(false);
	selected_index = $state(0);
	// Search text the semantic search last ran for, set once typing pauses
	related_query = $state('');
	#related_timeout: ReturnType<typeof setTimeout> | undefined;

	// Lazy load data the first time the palette opens
	#posts_query = $derived(this.has_opened ? get_posts() : null);
	#tags_query = $derived(this.has_opened ? get_post_tags() : null);
	loading = $derived(
		Boolean(this.#posts_query?.loading || this.#tags_query?.loading),
	);

	// Semantic search, runs alongside the instant keyword filter
	#related_search = $derived(
		this.related_query ? search_posts(this.related_query) : null,
	);
	searching = $derived.by(() => {
		const q = this.query.trim();
		if (q.length < MIN_RELATED_QUERY_LENGTH) return false;
		// Waiting on the debounce, then on the request
		return (
			q !== this.related_query ||
			Boolean(this.#related_search?.loading)
		);
	});

	#all_items = $derived<SearchItem[]>([
		...(this.#posts_query?.current ?? [])
			.filter((p) => !p.is_private)
			.map((p) => ({
				type: 'post' as const,
				title: p.title,
				href: `/posts/${p.slug}`,
				preview: p.preview,
			})),
		...(this.#tags_query?.current?.tags ?? []).map((t) => ({
			type: 'tag' as const,
			title: t,
			href: `/tags/${t}`,
		})),
		...all_pages,
	]);

	#filtered_items = $derived.by(() => {
		const q = this.query.toLowerCase().trim();
		if (!q) {
			// Show recent if available
			return this.recent
				.map((href) => this.#all_items.find((i) => i.href === href))
				.filter((i): i is SearchItem => i !== undefined);
		}
		// Match every word independently so order and gaps don't matter
		const terms = q.split(/\s+/);
		return this.#all_items.filter((item) => {
			const haystack =
				`${item.title} ${item.preview ?? ''}`.toLowerCase();
			return terms.every((term) => haystack.includes(term));
		});
	});

	// Group items by type
	grouped_items = $derived.by(() => {
		// Semantic matches the keyword filter didn't already find, shown
		// only while they belong to the text in the search box
		const matched = new Set(this.#filtered_items.map((i) => i.href));
		const related: SearchItem[] =
			this.query.trim() === this.related_query
				? (this.#related_search?.current ?? [])
						.map((p) => ({
							type: 'post' as const,
							title: p.title,
							href: `/posts/${p.slug}`,
						}))
						.filter((i) => !matched.has(i.href))
				: [];
		return {
			posts: this.#filtered_items.filter((i) => i.type === 'post'),
			tags: this.#filtered_items.filter((i) => i.type === 'tag'),
			pages: this.#filtered_items.filter((i) => i.type === 'page'),
			related,
		};
	});

	// Flat list for keyboard navigation
	flat_items = $derived([
		...this.grouped_items.posts,
		...this.grouped_items.tags,
		...this.grouped_items.pages,
		...this.grouped_items.related,
	]);

	// Attach function for dialog - register element with state
	register = (dialog: HTMLDialogElement) => {
		this.dialog = dialog;
		return () => {
			this.dialog = null;
		};
	};

	// Attach function for input - register for focus management
	register_input = (input: HTMLInputElement) => {
		this.input = input;
		return () => {
			this.input = null;
		};
	};

	// Setter for the search input binding
	set_query = (value: string) => {
		this.query = value;
		this.selected_index = 0;

		clearTimeout(this.#related_timeout);
		const q = value.trim();
		if (q.length < MIN_RELATED_QUERY_LENGTH) {
			this.related_query = '';
			return;
		}
		this.#related_timeout = setTimeout(() => {
			this.related_query = q;
		}, RELATED_DEBOUNCE_MS);
	};

	open() {
		if (!this.dialog?.open) {
			this.is_open = true;
			this.has_opened = true;
			this.dialog?.showModal();
			this.input?.focus();
		}
	}

	close() {
		this.is_open = false;
		this.dialog?.close();
		this.set_query('');
	}

	toggle() {
		if (this.is_open) {
			this.close();
		} else {
			this.open();
		}
	}

	add_recent(href: string) {
		// Remove if already exists, add to front, keep max 5
		this.recent = [
			href,
			...this.recent.filter((r) => r !== href),
		].slice(0, 5);
	}
}

export const command_palette_state = new CommandPaletteState();
