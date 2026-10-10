import * as sqlite_module from '#lib/sqlite/client.js';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { search_posts_by_embedding } from './embeddings';

vi.mock('$app/env/private', () => ({
	VOYAGE_AI_API_KEY: 'test-voyage-key',
}));

// Mock the sqlite_client
vi.mock('#lib/sqlite/client.js', () => ({
	sqlite_client: { prepare: vi.fn() },
}));

const mock_embedding = Array.from({ length: 1024 }, () => 0.1);

const mock_voyage_response = (ok = true) =>
	vi.fn().mockResolvedValue({
		ok,
		status: ok ? 200 : 500,
		text: () => Promise.resolve('voyage is down'),
		json: () =>
			Promise.resolve({ data: [{ embedding: mock_embedding }] }),
	});

describe('search_posts_by_embedding', () => {
	let mock_all: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mock_all = vi.fn().mockReturnValue([]);
		vi.mocked(sqlite_module.sqlite_client.prepare).mockReturnValue({
			all: mock_all,
		} as any);
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('embeds the search text as a query, not a document', async () => {
		const mock_fetch = mock_voyage_response();
		vi.stubGlobal('fetch', mock_fetch);

		await search_posts_by_embedding('global state in gatsby');

		const [url, options] = mock_fetch.mock.calls[0];
		expect(url).toBe('https://api.voyageai.com/v1/embeddings');
		expect(JSON.parse(options.body)).toEqual({
			model: 'voyage-3',
			input: 'global state in gatsby',
			input_type: 'query',
		});
	});

	it('only searches public posts and over-fetches for the filter', async () => {
		vi.stubGlobal('fetch', mock_voyage_response());

		await search_posts_by_embedding('gatsby', 5);

		const sql = vi.mocked(sqlite_module.sqlite_client.prepare).mock
			.calls[0][0];
		expect(sql).toContain('p.is_private = 0');
		expect(mock_all).toHaveBeenCalledWith(
			JSON.stringify(mock_embedding),
			15,
		);
	});

	it('returns the closest posts in order as slug and title', async () => {
		vi.stubGlobal('fetch', mock_voyage_response());
		mock_all.mockReturnValue([
			{ slug: 'react-context', title: 'React Context', distance: 1 },
			{ slug: 'gatsby-blog', title: 'Gatsby Blog', distance: 1.1 },
		]);

		expect(await search_posts_by_embedding('gatsby context')).toEqual(
			[
				{ slug: 'react-context', title: 'React Context' },
				{ slug: 'gatsby-blog', title: 'Gatsby Blog' },
			],
		);
	});

	it('drops posts that are too far from the search text', async () => {
		vi.stubGlobal('fetch', mock_voyage_response());
		mock_all.mockReturnValue([
			{ slug: 'close', title: 'Close', distance: 1.05 },
			{ slug: 'far', title: 'Far', distance: 1.25 },
		]);

		expect(await search_posts_by_embedding('sourdough')).toEqual([
			{ slug: 'close', title: 'Close' },
		]);
	});

	it('respects the result limit', async () => {
		vi.stubGlobal('fetch', mock_voyage_response());
		mock_all.mockReturnValue(
			Array.from({ length: 6 }, (_, i) => ({
				slug: `post-${i}`,
				title: `Post ${i}`,
				distance: 1,
			})),
		);

		const results = await search_posts_by_embedding('posts', 2);

		expect(results.map((r) => r.slug)).toEqual(['post-0', 'post-1']);
	});

	it('throws when the embedding request fails', async () => {
		vi.stubGlobal('fetch', mock_voyage_response(false));

		await expect(
			search_posts_by_embedding('gatsby context'),
		).rejects.toThrow('HTTP error! status: 500');
		expect(mock_all).not.toHaveBeenCalled();
	});
});
