import { get_post_movers } from '#lib/data/post-trends.remote.js';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import PostMovers from './post-movers.svelte';

vi.mock('#lib/data/post-trends.remote.js', () => ({
	get_post_movers: vi.fn(),
}));

const mover = (overrides: Partial<PostMover>): PostMover => ({
	slug: 'a-post',
	title: 'A post',
	pub: '2025-03-30',
	recent: 100,
	previous: 100,
	change: 0,
	...overrides,
});

describe('PostMovers', () => {
	it('lists falls and rises with links and percentages', async () => {
		vi.mocked(get_post_movers).mockResolvedValue({
			fallers: [
				mover({
					slug: 'configuring-mcp-tools-in-claude-code',
					title: 'Configuring MCP Tools',
					recent: 9461,
					previous: 42426,
					change: -32965,
				}),
			],
			risers: [
				mover({
					slug: 'fathom-create-custom-domain',
					title: 'Fathom custom domain',
					recent: 1092,
					previous: 487,
					change: 605,
				}),
			],
			window_days: 90,
			recent_from: '2026-07-15',
			last_date: '2026-10-12',
		} as never);

		await render(PostMovers);

		await expect
			.element(
				page.getByRole('heading', { name: 'Risers and fallers' }),
			)
			.toBeInTheDocument();
		await expect
			.element(
				page.getByRole('link', { name: 'Configuring MCP Tools' }),
			)
			.toHaveAttribute(
				'href',
				'/posts/configuring-mcp-tools-in-claude-code',
			);
		await expect.element(page.getByText('−78%')).toBeInTheDocument();
		await expect.element(page.getByText('+124%')).toBeInTheDocument();
		await expect
			.element(page.getByText(/last 90 days \(15 Jul – 12 Oct\)/))
			.toBeInTheDocument();
	});

	it('renders nothing without data', async () => {
		vi.mocked(get_post_movers).mockResolvedValue(null as never);
		const { container } = await render(PostMovers);
		expect(container.querySelector('section')).toBeNull();
	});
});
