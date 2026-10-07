import { render } from 'svelte/server';
import { afterEach, expect, it, vi } from 'vitest';
import TailwindPost from '../../../posts/how-to-set-up-svelte-with-tailwind.md';

afterEach(() => vi.restoreAllMocks());

it('renders the Tailwind post age from its frontmatter date', async () => {
	vi.spyOn(Date, 'now').mockReturnValue(
		new Date('2026-10-07T12:00:00Z').getTime(),
	);

	const { body } = await render(TailwindPost);

	expect(body).toContain(
		'data-testid="date-distance">5 years</span>',
	);
});
