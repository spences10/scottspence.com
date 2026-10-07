import '../../app.css';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Small from './small.svelte';

const paragraph = createRawSnippet(() => ({
	render: () => '<p>This is a supporting note.</p>',
}));

describe('Small notes', () => {
	it.each(['p', 'h2'])(
		'does not overlap the preceding %s in prose',
		async (tag) => {
			const { container } = await render(Small, {
				children: paragraph,
			});
			container.classList.add('all-prose');
			const previous = document.createElement(tag);
			previous.textContent = 'The preceding text';
			container.prepend(previous);
			const note = container.querySelector('.small-note')!;

			await expect
				.element(page.getByText('This is a supporting note.'))
				.toBeVisible();
			expect(note.getBoundingClientRect().top).toBeGreaterThanOrEqual(
				previous.getBoundingClientRect().bottom,
			);
			const text = note.querySelector('p')!;
			expect(getComputedStyle(text).fontSize).toBe(
				getComputedStyle(note).fontSize,
			);
			expect(getComputedStyle(text).marginTop).toBe('0px');
			expect(getComputedStyle(text).marginBottom).toBe('0px');
		},
	);

	it('also renders inline snippet content', async () => {
		const children = createRawSnippet(() => ({
			render: () => '<span>Updated today</span>',
		}));
		await render(Small, { children });
		await expect
			.element(page.getByText('Updated today'))
			.toBeVisible();
	});

	it('allows an empty note', async () => {
		const { container } = await render(Small);
		expect(
			container.querySelector('.small-note')?.textContent?.trim(),
		).toBe('');
	});
});
