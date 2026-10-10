import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TableOfContents from './table-of-contents.svelte';

const headings = [
	{ label: 'First section', href: '#first-section' },
	{ label: 'Second section', href: '#second-section' },
	{ label: 'Third section', href: '#third-section' },
];

describe('TableOfContents', () => {
	let content: HTMLElement;

	beforeEach(async () => {
		await page.viewport(1280, 800);
		content = document.createElement('div');
		content.innerHTML = headings
			.map(
				({ label, href }) =>
					`<h2 id="${href.slice(1)}" style="margin: 0; height: 40px">${label}</h2><div style="height: 1500px"></div>`,
			)
			.join('');
		content.style.paddingTop = '600px';
		document.body.appendChild(content);
	});

	afterEach(() => {
		content.remove();
		window.scrollTo({ top: 0, behavior: 'instant' });
	});

	const scroll_to_heading = (id: string) => {
		const top =
			document.getElementById(id)!.getBoundingClientRect().top +
			window.scrollY;
		// lands where a clicked heading does, clear of the sticky nav
		window.scrollTo({ top: top - 110, behavior: 'instant' });
	};

	test('no heading is current before the first section is reached', async () => {
		render(TableOfContents, { headings });

		await expect
			.element(page.getByRole('link', { name: 'First section' }))
			.not.toHaveAttribute('aria-current');
	});

	test('marks the section being read as the current location', async () => {
		render(TableOfContents, { headings });
		const first = page.getByRole('link', { name: 'First section' });
		const second = page.getByRole('link', { name: 'Second section' });

		scroll_to_heading('second-section');

		await expect
			.element(second)
			.toHaveAttribute('aria-current', 'location');
		await expect.element(first).not.toHaveAttribute('aria-current');
	});

	test('stays on a section while scrolling through its content', async () => {
		render(TableOfContents, { headings });

		scroll_to_heading('first-section');
		window.scrollBy({ top: 700, behavior: 'instant' });

		await expect
			.element(page.getByRole('link', { name: 'First section' }))
			.toHaveAttribute('aria-current', 'location');
	});

	test('picks up the current section when rendered mid-page', async () => {
		scroll_to_heading('third-section');

		render(TableOfContents, { headings });

		await expect
			.element(page.getByRole('link', { name: 'Third section' }))
			.toHaveAttribute('aria-current', 'location');
	});
});
