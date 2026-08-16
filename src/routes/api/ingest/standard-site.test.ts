import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
	ATPROTO_APP_PASSWORD: '',
	ATPROTO_IDENTIFIER: '',
	ATPROTO_SERVICE: '',
}));

import {
	build_standard_site_document,
	get_standard_site_icon,
	resolve_standard_site_pds,
	standard_site_sync,
	to_plain_text,
	validate_standard_site_sync,
} from './standard-site';

const TID_PATTERN =
	/^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

describe('Standard.site ingestion', () => {
	it('accepts an explicit preview mode and optional slug', () => {
		expect(
			validate_standard_site_sync({
				mode: 'preview',
				slug: 'hello-world',
			}),
		).toEqual({ mode: 'preview', slug: 'hello-world' });
	});

	it('rejects missing modes and invalid slugs', () => {
		expect(() => validate_standard_site_sync({})).toThrow();
		expect(() =>
			validate_standard_site_sync({
				mode: 'preview',
				slug: '../private-post',
			}),
		).toThrow();
	});

	it('creates plain text from a Markdown post', () => {
		const markdown = [
			'---',
			'title: Example',
			'---',
			'<scr' + 'ipt>',
			"\timport Demo from './demo.svelte'",
			'</scr' + 'ipt>',
			'# Heading',
			'',
			'Read [the guide](https://example.com) and **enjoy it**.',
			'',
			'`inline code`',
			'',
			'```ts',
			'const answer = 42',
			'```',
		].join('\n');

		expect(to_plain_text(markdown)).toBe(
			'Heading\n\nRead the guide and enjoy it.\n\ninline code\n\nconst answer = 42',
		);
	});

	it('builds a lexicon-shaped document with a TID key', () => {
		const document = build_standard_site_document(
			'hello-world',
			{
				date: '2020-01-02',
				title: 'Hello world',
				tags: ['svelte'],
				preview: 'A post preview',
				is_private: false,
			} as Post,
			'# Hello world',
		);

		expect(document.rkey).toMatch(TID_PATTERN);
		expect(document.record).toMatchObject({
			$type: 'site.standard.document',
			site: expect.stringContaining('/site.standard.publication/'),
			path: '/posts/hello-world',
			title: 'Hello world',
			publishedAt: '2020-01-02T00:00:00.000Z',
			description: 'A post preview',
			tags: ['svelte'],
			textContent: 'Hello world',
		});
	});

	it('reuses the Bluesky profile avatar as the publication icon', async () => {
		const avatar = {
			$type: 'blob' as const,
			ref: { $link: 'bafkreiexample' },
			mimeType: 'image/jpeg',
			size: 146_531,
		};
		const fetch = vi
			.fn()
			.mockResolvedValue(Response.json({ value: { avatar } }));

		await expect(
			get_standard_site_icon(fetch, 'https://eurosky.social'),
		).resolves.toEqual(avatar);
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('/xrpc/com.atproto.repo.getRecord?'),
		);
	});

	it('resolves the account PDS from its DID document', async () => {
		const fetch = vi.fn().mockResolvedValue(
			Response.json({
				service: [
					{
						id: '#atproto_pds',
						type: 'AtprotoPersonalDataServer',
						serviceEndpoint: 'https://eurosky.social',
					},
				],
			}),
		);

		await expect(resolve_standard_site_pds(fetch)).resolves.toBe(
			'https://eurosky.social',
		);
		expect(fetch).toHaveBeenCalledWith(
			'https://plc.directory/did:plc:nlvjelw3dy3pddq7qoglleko',
		);
	});

	it('previews a real public post without writing records', async () => {
		const fetch = vi.fn();
		const result = await standard_site_sync(fetch, {
			mode: 'preview',
			slug: 'hello-world',
		});

		expect(result).toMatchObject({
			success: true,
			mode: 'preview',
			writes_performed: 0,
			document_count: 1,
		});
		expect(fetch).not.toHaveBeenCalled();
	});
});
