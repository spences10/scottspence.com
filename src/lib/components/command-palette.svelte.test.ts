import { command_palette_state } from '#lib/state/command-palette.svelte.js';
import { flushSync } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import CommandPalette from './command-palette.svelte';

const mock_posts = [
	{
		title: 'Use the React Context API with Gatsby',
		slug: 'react-context-api-with-gatsby',
		preview: 'Share state across a Gatsby site',
		is_private: false,
	},
	{
		title: 'Notes on Svelte',
		slug: 'notes-on-svelte',
		preview: 'Things learned along the way',
		is_private: false,
	},
	{
		title: 'Secret Gatsby Context Draft',
		slug: 'secret-draft',
		preview: 'Not published yet',
		is_private: true,
	},
];

// Remote queries are read through their reactive properties
const resolved = <T>(current: T) => ({
	current,
	loading: false,
	error: undefined,
});
const failed = () => ({
	current: undefined,
	loading: false,
	error: { message: 'offline' },
});

// Mock the remote functions
vi.mock('#lib/data/posts.remote.js', () => ({
	get_posts: vi.fn(() => resolved(mock_posts)),
}));

vi.mock('#lib/data/post-tags.remote.js', () => ({
	get_post_tags: vi.fn(() => resolved({ tags: ['gatsby'] })),
}));

const mock_search_posts = vi.fn();
vi.mock('#lib/data/search-posts.remote.js', () => ({
	search_posts: (search_text: string) =>
		mock_search_posts(search_text),
}));

const mock_goto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: (href: string) => mock_goto(href),
}));

const open_palette = async () => {
	render(CommandPalette);
	command_palette_state.open();
	flushSync();
	const input = page.getByRole('searchbox');
	await expect.element(input).toBeInTheDocument();
	return input;
};

const option = (name: string) =>
	page.getByRole('option', { name, exact: true });

describe('CommandPalette Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mock_search_posts.mockReturnValue(resolved([]));
		command_palette_state.close();
		command_palette_state.recent = [];
	});

	describe('Keyword search', () => {
		it('should match words in any order', async () => {
			const input = await open_palette();

			await input.fill('gatsby context');

			await expect
				.element(option('Use the React Context API with Gatsby'))
				.toBeInTheDocument();
			await expect
				.element(option('Notes on Svelte'))
				.not.toBeInTheDocument();
		});

		it('should match words found in the preview', async () => {
			const input = await open_palette();

			await input.fill('learned svelte');

			await expect
				.element(option('Notes on Svelte'))
				.toBeInTheDocument();
		});

		it('should not list private posts', async () => {
			const input = await open_palette();

			await input.fill('gatsby context');

			await expect
				.element(option('Use the React Context API with Gatsby'))
				.toBeInTheDocument();
			await expect
				.element(option('Secret Gatsby Context Draft'))
				.not.toBeInTheDocument();
		});

		it('should show no results once the related search is empty', async () => {
			const input = await open_palette();

			await input.fill('sourdough');

			await expect
				.element(page.getByText('No results found'))
				.toBeInTheDocument();
		});
	});

	describe('Related posts', () => {
		it('should list semantic matches the keyword search missed', async () => {
			mock_search_posts.mockReturnValue(
				resolved([
					{
						slug: 'react-context-api-with-gatsby',
						title: 'Use the React Context API with Gatsby',
					},
				]),
			);
			const input = await open_palette();

			await input.fill('global state in gatsby');

			await expect
				.element(page.getByText('Related posts'))
				.toBeInTheDocument();
			await expect
				.element(option('Use the React Context API with Gatsby'))
				.toBeInTheDocument();
			expect(mock_search_posts).toHaveBeenCalledWith(
				'global state in gatsby',
			);
		});

		it('should not repeat posts the keyword search already found', async () => {
			mock_search_posts.mockReturnValue(
				resolved([
					{
						slug: 'react-context-api-with-gatsby',
						title: 'Use the React Context API with Gatsby',
					},
					{ slug: 'gatsby-mdx-blog', title: 'Gatsby MDX Blog' },
				]),
			);
			const input = await open_palette();

			await input.fill('gatsby context');

			await expect
				.element(option('Gatsby MDX Blog'))
				.toBeInTheDocument();
			expect(
				page
					.getByRole('option', {
						name: 'Use the React Context API with Gatsby',
					})
					.elements(),
			).toHaveLength(1);
		});

		it('should only search once typing pauses', async () => {
			const input = await open_palette();

			await input.fill('glo');
			await input.fill('global state');

			await expect
				.poll(() => mock_search_posts.mock.calls)
				.toEqual([['global state']]);
		});

		it('should not search for queries under three characters', async () => {
			const input = await open_palette();

			await input.fill('ga');
			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(mock_search_posts).not.toHaveBeenCalled();
		});

		it('should keep keyword results when the related search fails', async () => {
			mock_search_posts.mockReturnValue(failed());
			const input = await open_palette();

			await input.fill('gatsby context');

			await expect
				.poll(() => mock_search_posts.mock.calls.length)
				.toBe(1);
			await expect
				.element(option('Use the React Context API with Gatsby'))
				.toBeInTheDocument();
			await expect
				.element(page.getByText('Related posts'))
				.not.toBeInTheDocument();
		});

		it('should reset the selection when the search text changes', async () => {
			mock_search_posts.mockReturnValue(
				resolved([
					{ slug: 'gatsby-mdx-blog', title: 'Gatsby MDX Blog' },
				]),
			);
			const input = await open_palette();

			await input.fill('gatsby context');
			await expect
				.element(option('Gatsby MDX Blog'))
				.toBeInTheDocument();
			input.element().dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowDown',
					bubbles: true,
				}),
			);
			await expect
				.element(option('Gatsby MDX Blog'))
				.toHaveAttribute('aria-selected', 'true');

			await input.fill('gatsby');

			await expect
				.element(option('Use the React Context API with Gatsby'))
				.toHaveAttribute('aria-selected', 'true');
		});

		it('should open a related post with the keyboard', async () => {
			mock_search_posts.mockReturnValue(
				resolved([
					{ slug: 'gatsby-mdx-blog', title: 'Gatsby MDX Blog' },
				]),
			);
			const input = await open_palette();

			await input.fill('global state in gatsby');
			await expect
				.element(option('Gatsby MDX Blog'))
				.toBeInTheDocument();
			await input.click();
			await page
				.getByRole('searchbox')
				.element()
				.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'Enter',
						bubbles: true,
					}),
				);

			expect(mock_goto).toHaveBeenCalledWith(
				'/posts/gatsby-mdx-blog',
			);
		});
	});
});
