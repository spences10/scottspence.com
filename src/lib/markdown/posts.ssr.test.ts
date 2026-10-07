import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { afterEach, expect, it, vi } from 'vitest';
import TailwindPost from '../../../posts/how-to-set-up-svelte-with-tailwind.md';

// Remote functions need a request. The signup form only awaits this count.
vi.mock('#lib/data/subscribers.remote.js', () => ({
	get_subscriber_count: () => new Promise(() => {}),
}));

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

const documents = import.meta.glob<{ default: Component }>([
	'../../../posts/*.md',
	'../../../copy/*.md',
	'../../../newsletter/*.md',
]);

it.each(
	Object.entries(documents).filter(
		([filename]) => !filename.endsWith('/README.md'),
	),
)(
	'renders the native document on the server: %s',
	async (_filename, load) => {
		const { default: Content } = await load();
		const { body } = await render(Content);
		expect(body.length).toBeGreaterThan(0);
	},
);
