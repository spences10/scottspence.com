import { get_post_tags } from '#lib/post-tags.js';
import { get_posts } from '#lib/posts.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './+server';

vi.mock('#lib/posts.js', () => ({ get_posts: vi.fn() }));
vi.mock('#lib/post-tags.js', () => ({ get_post_tags: vi.fn() }));

const make_post = (
	slug: string,
	overrides: Partial<Post> = {},
): Post => ({
	slug,
	date: '2026-01-01T00:00:00.000Z',
	title: slug,
	tags: [],
	is_private: false,
	reading_time: {
		text: '1 min read',
		minutes: 1,
		time: 60000,
		words: 100,
	},
	reading_time_text: '1 min read',
	preview: '',
	preview_html: '',
	previewHtml: '',
	path: `/posts/${slug}`,
	...overrides,
});

const entry_for = (xml: string, path: string) =>
	[...xml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)]
		.map((match) => match[1])
		.find((entry) =>
			entry.includes(`<loc>https://scottspence.com${path}</loc>`),
		);

describe('sitemap modification dates', () => {
	beforeEach(() => {
		vi.mocked(get_posts).mockResolvedValue({ posts: [] });
		vi.mocked(get_post_tags).mockResolvedValue({
			tags: [],
			posts_by_tag: {},
		});
	});

	it('uses frontmatter updates without needing a database update date', async () => {
		vi.mocked(get_posts).mockResolvedValue({
			posts: [make_post('nopeek-keep-secrets-out-of-claude-code')],
		});

		const response = await GET();
		const xml = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe(
			'application/xml',
		);
		expect(
			entry_for(xml, '/posts/nopeek-keep-secrets-out-of-claude-code'),
		).toContain('<lastmod>2026-09-13</lastmod>');
	});

	it('keeps publication dates when updated or local metadata is absent', async () => {
		vi.mocked(get_posts).mockResolvedValue({
			posts: [
				make_post('zsh-and-oh-my-zsh'),
				make_post('database-only-post'),
			],
		});

		const xml = await (await GET()).text();

		for (const slug of ['zsh-and-oh-my-zsh', 'database-only-post']) {
			expect(entry_for(xml, `/posts/${slug}`)).toContain(
				'<lastmod>2026-01-01</lastmod>',
			);
		}
	});

	it('preserves the August SEO exclusions and omits filesystem dates', async () => {
		vi.mocked(get_posts).mockResolvedValue({
			posts: [
				make_post('one', { tags: ['guide', 'thin'] }),
				make_post('two', { tags: ['guide'] }),
				make_post('three', { tags: ['guide'] }),
				make_post('private', {
					is_private: true,
					tags: ['thin', 'private-only'],
				}),
			],
		});
		vi.mocked(get_post_tags).mockResolvedValue({
			tags: ['guide', 'thin', 'private-only'],
			posts_by_tag: {},
		});

		const xml = await (await GET()).text();

		expect(entry_for(xml, '')).toBeDefined();
		expect(entry_for(xml, '')).not.toContain('<lastmod>');
		expect(entry_for(xml, '/about')).not.toContain('<lastmod>');
		expect(entry_for(xml, '/tags/guide')).toBeDefined();
		for (const path of [
			'/heatmap',
			'/my-todo-list',
			'/newsletter/verify',
			'/reactions-leaderboard',
			'/seo-outreach',
			'/stats',
			'/posts/private',
			'/tags/thin',
			'/tags/private-only',
		]) {
			expect(entry_for(xml, path)).toBeUndefined();
		}
	});
});
