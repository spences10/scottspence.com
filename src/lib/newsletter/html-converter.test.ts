import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { convert_newsletter_to_html } from './html-converter.js';

const document = (body: string, published = 'true') =>
	`---\ntitle: 'A & B'\npublished: ${published}\n---\n\n${body}`;

describe('native PFM newsletter emails', () => {
	it('keeps bold, italic, links and escaped code in the email', async () => {
		const { html, title, published } =
			await convert_newsletter_to_html(
				document(
					'*Bold* and _italic_.\n\n[Read more](https://example.com)\n\n```js\nconst value = "<script>{example}</script>";\n```',
				),
			);
		expect(title).toBe('A & B');
		expect(published).toBe(true);
		expect(html).toContain('<title>A &#x26; B</title>');
		expect(html).toContain('<strong>Bold</strong>');
		expect(html).toContain('<em>italic</em>');
		expect(html).toContain('href="https://example.com"');
		expect(html).toContain('&#x3C;script>{example}&#x3C;/script>');
		expect(html).not.toContain('<script>');
	});

	it('keeps lists, tables and authored email styles without executable HTML', async () => {
		const { html } = await convert_newsletter_to_html(
			document(
				'- *First*\n- Second\n\n| Name | Value |\n| --- | --- |\n| One | Two |\n\n<div style="text-align: center" onclick="alert(1)">Hello</div>\n\n<script>alert(1)</script>',
			),
		);
		expect(html).toContain('<li><strong>First</strong></li>');
		expect(html).toContain('<table>');
		expect(html).toContain('<td>Two</td>');
		expect(html).toContain('style="text-align: center"');
		expect(html).not.toContain('onclick=');
		expect(html).not.toContain('alert(1)');
	});

	it.each(['false', '"false"', '"true"'])(
		'never treats published: %s as permission to send',
		async (published) => {
			const result = await convert_newsletter_to_html(
				document('Draft', published),
			);
			expect(result.published).toBe(false);
		},
	);

	it('supports YAML titles and Windows line endings', async () => {
		const source =
			'---\r\ntitle: >-\r\n  Monthly update\r\npublished: false\r\n---\r\n\r\n*Hello*';
		const result = await convert_newsletter_to_html(source);
		expect(result.title).toBe('Monthly update');
		expect(result.html).toContain('<strong>Hello</strong>');
	});

	it('preserves the unsubscribe token in the re-introduction email', async () => {
		const { html } = await convert_newsletter_to_html(
			readFileSync(
				'newsletter/re-re-introduction-round-three.md',
				'utf8',
			),
		);
		expect(html).toContain('href="{{{RESEND_UNSUBSCRIBE_URL}}}"');
		expect(html).not.toContain('{unsubscribe_url}');
		expect(html).not.toContain('<script');
	});

	it.each(
		globSync('newsletter/*.md').filter(
			(file) => !file.endsWith('/README.md'),
		),
	)('renders the existing newsletter: %s', async (filename) => {
		const { html, title } = await convert_newsletter_to_html(
			readFileSync(filename, 'utf8'),
		);
		expect(title).not.toBe('Newsletter');
		expect(html).toContain('class="email-content"');
		expect(html).toContain('{{{RESEND_UNSUBSCRIBE_URL}}}');
		expect(html).not.toContain('<script');
	});
});
