import { get_launch_board } from '#lib/data/post-trends.remote.js';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import PostLaunches from './post-launches.svelte';

vi.mock('#lib/data/post-trends.remote.js', () => ({
	get_launch_board: vi.fn(),
}));

describe('PostLaunches', () => {
	it('charts launches and lists them with partial windows marked', async () => {
		vi.mocked(get_launch_board).mockResolvedValue({
			launches: [
				{
					slug: 'revisiting-lsp-in-claude-code',
					title: 'Revisiting LSP in Claude Code',
					pub: '2026-10-10',
					views: 435,
					days_live: 4,
				},
				{
					slug: 'agentic-engineering-practical-guide',
					title: 'Agentic engineering',
					pub: '2026-08-25',
					views: 4747,
					days_live: 49,
				},
			],
			days: 30,
			median: 517,
		} as never);

		await render(PostLaunches);

		await expect
			.element(page.getByRole('heading', { name: 'New posts' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText(/The median is 517/))
			.toBeInTheDocument();
		await expect
			.element(page.getByTestId('launches-chart').getByText('Median'))
			.toBeInTheDocument();
		await page.getByText('View as list').click();
		await expect
			.element(
				page.getByRole('link', {
					name: 'Revisiting LSP in Claude Code (4 days so far)',
				}),
			)
			.toHaveAttribute(
				'href',
				'/posts/revisiting-lsp-in-claude-code',
			);
	});

	it('renders nothing without launches', async () => {
		vi.mocked(get_launch_board).mockResolvedValue(null as never);
		const { container } = await render(PostLaunches);
		expect(container.querySelector('section')).toBeNull();
	});
});
