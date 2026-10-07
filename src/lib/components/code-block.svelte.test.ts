import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { line_numbers_state } from '#lib/state/line-numbers.svelte.js';
import CodeBlock from './code-block.svelte';

const code = 'const a = 1;\n\tconst b = 2;';
const children = createRawSnippet(() => ({
	render: () =>
		'<pre class="twinkleplop" tabindex="0"><code><span class="l"><span class="ln">99</span>const a = 1;</span>\n<span class="l"><span class="ln">100</span>\tconst b = 2;</span></code></pre>',
}));

afterEach(() => {
	vi.restoreAllMocks();
	document.documentElement.removeAttribute('data-line-numbers');
	document.cookie = 'line_numbers=; max-age=0; path=/;';
	line_numbers_state.sync();
});

describe('code-block controls', () => {
	it('shows the filename, caption and language with native children', async () => {
		const { container } = await render(CodeBlock, {
			children,
			code,
			lang: 'ts',
			meta: ':line-numbers=99',
			title: 'math.ts',
			caption: 'Example code',
		});
		await expect.element(page.getByText('math.ts')).toBeVisible();
		await expect
			.element(page.getByText('Example code'))
			.toBeVisible();
		await expect
			.element(page.getByRole('img', { name: 'TypeScript' }))
			.toBeVisible();
		expect(
			container.querySelector('pre')?.getAttribute('tabindex'),
		).toBe('0');
		expect(
			container.querySelector('.code-block')?.getAttribute('style'),
		).toContain('--ln-digits: 3');
	});

	it('copies visible code without line numbers and keeps indentation', async () => {
		const clipboard = vi
			.spyOn(navigator.clipboard, 'writeText')
			.mockResolvedValue();
		await render(CodeBlock, { children, code, lang: 'ts' });
		await page.getByRole('button', { name: 'Copy code' }).click();
		expect(clipboard).toHaveBeenCalledWith(code);
		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('Copied');
	});

	it('reports clipboard failures', async () => {
		vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
			new Error('Denied'),
		);
		await render(CodeBlock, { children, code });
		await page.getByRole('button', { name: 'Copy code' }).click();
		await expect
			.element(page.getByRole('status'))
			.toHaveTextContent('Copy failed');
	});

	it('toggles line numbers and stores the reader preference', async () => {
		await render(CodeBlock, { children, code });
		const toggle = page.getByRole('button', { name: 'Line numbers' });
		await expect
			.element(toggle)
			.toHaveAttribute('aria-pressed', 'false');
		await toggle.click();
		await expect
			.element(toggle)
			.toHaveAttribute('aria-pressed', 'true');
		expect(
			document.documentElement.hasAttribute('data-line-numbers'),
		).toBe(true);
		expect(document.cookie).toContain('line_numbers=1');
		await toggle.click();
		await expect
			.element(toggle)
			.toHaveAttribute('aria-pressed', 'false');
	});
});
