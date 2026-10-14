import type { SqliteClient } from '#lib/sqlite/client.js';
import { describe, expect, it, vi } from 'vitest';
import {
	build_launch_curve,
	fetch_launch_cohort_views,
	fetch_post_movers,
	fetch_reactions_summary,
	median_launch_curve,
	pick_movers,
	rank_launch,
	type LaunchCurve,
} from './post-analytics.helpers';

const curve = (
	daily: number[],
	days_live = daily.length,
): LaunchCurve => {
	let total = 0;
	return {
		cumulative: daily.map((v, i) =>
			i < days_live ? (total += v) : null,
		),
		first_view_date: '2026-09-01',
		days_live,
	};
};

const mock_client = (...results: Record<string, unknown>[][]) => {
	const execute = vi.fn();
	for (const rows of results) execute.mockReturnValueOnce({ rows });
	return { execute } as unknown as SqliteClient & {
		execute: ReturnType<typeof vi.fn>;
	};
};

describe('build_launch_curve', () => {
	it('counts from the first day with views, not the post date', () => {
		const result = build_launch_curve(
			[
				{ date: '2026-09-09', views: 0 },
				{ date: '2026-09-26', views: 10 },
				{ date: '2026-09-27', views: 5 },
			],
			'2026-10-13',
			5,
		);
		expect(result?.first_view_date).toBe('2026-09-26');
		expect(result?.cumulative).toEqual([10, 15, 15, 15, 15]);
	});

	it('fills days with no rows as zero views', () => {
		const result = build_launch_curve(
			[
				{ date: '2026-10-01', views: 4 },
				{ date: '2026-10-03', views: 6 },
			],
			'2026-10-13',
			4,
		);
		expect(result?.cumulative).toEqual([4, 4, 10, 10]);
	});

	it('leaves days after the last day of data as null', () => {
		const result = build_launch_curve(
			[
				{ date: '2026-10-11', views: 100 },
				{ date: '2026-10-12', views: 50 },
			],
			'2026-10-13',
			5,
		);
		expect(result?.days_live).toBe(3);
		expect(result?.cumulative).toEqual([100, 150, 150, null, null]);
	});

	it('returns null when the post has no views', () => {
		expect(
			build_launch_curve(
				[{ date: '2026-10-01', views: 0 }],
				'2026-10-13',
			),
		).toBeNull();
		expect(build_launch_curve([], '2026-10-13')).toBeNull();
	});
});

describe('median_launch_curve', () => {
	it('takes the median per day from launches with a full window', () => {
		const result = median_launch_curve(
			[curve([10, 10]), curve([20, 20]), curve([30, 30])],
			2,
		);
		expect(result).toEqual([20, 40]);
	});

	it('averages the middle pair for an even count', () => {
		expect(
			median_launch_curve([curve([10]), curve([20])], 1),
		).toEqual([15]);
	});

	it('ignores launches younger than the window', () => {
		const result = median_launch_curve(
			[curve([10, 10]), curve([1000, 0], 1)],
			2,
		);
		expect(result).toEqual([10, 20]);
	});

	it('returns nulls when no launch has a full window', () => {
		expect(median_launch_curve([curve([5, 5], 1)], 2)).toEqual([
			null,
			null,
		]);
	});
});

describe('rank_launch', () => {
	it('ranks against the cohort at the final day of the window', () => {
		const top = curve([100, 100]);
		const cohort = [curve([10, 10]), top, curve([50, 50])];
		expect(rank_launch(top, cohort, 2)).toEqual({
			day: 1,
			rank: 1,
			of: 3,
		});
	});

	it('compares a young post at its own age', () => {
		const young = curve([40, 0], 1);
		const cohort = [curve([50, 50]), curve([30, 30]), young];
		expect(rank_launch(young, cohort, 2)).toEqual({
			day: 0,
			rank: 2,
			of: 3,
		});
	});

	it('shares a rank on a tie', () => {
		const a = curve([10]);
		const b = curve([10]);
		expect(rank_launch(a, [a, b], 1).rank).toBe(1);
		expect(rank_launch(b, [a, b], 1).rank).toBe(1);
	});
});

describe('fetch_launch_cohort_views', () => {
	it('groups daily rows by slug with title and post date', () => {
		const client = mock_client([
			{
				slug: 'a',
				title: 'A',
				pub: '2026-09-30',
				date: '2026-10-01',
				views: 3,
			},
			{
				slug: 'b',
				title: 'B',
				pub: '2026-10-01',
				date: '2026-10-01',
				views: 1,
			},
			{
				slug: 'a',
				title: 'A',
				pub: '2026-09-30',
				date: '2026-10-02',
				views: 2,
			},
		]);
		const result = fetch_launch_cohort_views(client, '2025-12-28');

		expect(result.get('a')).toEqual({
			title: 'A',
			pub: '2026-09-30',
			rows: [
				{ date: '2026-10-01', views: 3 },
				{ date: '2026-10-02', views: 2 },
			],
		});
		expect(result.get('b')?.rows).toHaveLength(1);
		expect(client.execute.mock.calls[0][0].args).toEqual([
			'2025-12-28',
		]);
	});
});

describe('fetch_post_movers', () => {
	it('splits views at the window boundary and skips new posts', () => {
		const client = mock_client([
			{
				slug: 'a',
				title: 'A',
				pub: '2025-03-30',
				recent: 10,
				previous: 40,
			},
		]);
		const result = fetch_post_movers(client, '2026-10-12', 90);

		expect(result).toEqual([
			{
				slug: 'a',
				title: 'A',
				pub: '2025-03-30',
				recent: 10,
				previous: 40,
			},
		]);
		// split, split, window start, last date, latest post date allowed
		expect(client.execute.mock.calls[0][0].args).toEqual([
			'2026-07-14',
			'2026-07-14',
			'2026-04-15',
			'2026-10-12',
			'2026-04-15',
		]);
	});
});

describe('pick_movers', () => {
	const row = (slug: string, recent: number, previous: number) => ({
		slug,
		title: slug,
		pub: '2025-01-01',
		recent,
		previous,
	});

	it('orders the biggest rises and falls by absolute change', () => {
		const { risers, fallers } = pick_movers([
			row('small-rise', 110, 100),
			row('big-fall', 10, 1000),
			row('big-rise', 900, 100),
			row('small-fall', 90, 100),
			row('flat', 50, 50),
		]);

		expect(risers.map((r) => r.slug)).toEqual([
			'big-rise',
			'small-rise',
		]);
		expect(fallers.map((r) => r.slug)).toEqual([
			'big-fall',
			'small-fall',
		]);
		expect(fallers[0].change).toBe(-990);
	});

	it('limits each list to the requested count', () => {
		const rows = Array.from({ length: 12 }, (_, i) =>
			row(`p${i}`, 100 + i + 1, 100),
		);
		expect(pick_movers(rows, 8).risers).toHaveLength(8);
	});
});

describe('fetch_reactions_summary', () => {
	it('totals reactions and compares the rate with the site', () => {
		const client = mock_client(
			[
				{ reaction_type: 'likes', count: 120 },
				{ reaction_type: 'poops', count: 16 },
			],
			[
				{
					post_views: 100_000,
					site_reactions: 10_000,
					site_views: 10_000_000,
				},
			],
		);
		const result = fetch_reactions_summary(client, '/posts/a');

		expect(result).toEqual({
			total: 136,
			by_type: { likes: 120, poops: 16 },
			per_1k_views: 1.36,
			site_per_1k_views: 1,
		});
	});

	it('returns null when the post has no reactions', () => {
		const client = mock_client([]);
		expect(fetch_reactions_summary(client, '/posts/a')).toBeNull();
		expect(client.execute).toHaveBeenCalledTimes(1);
	});

	it('leaves the rate null without view data', () => {
		const client = mock_client(
			[{ reaction_type: 'likes', count: 5 }],
			[{ post_views: null, site_reactions: 5, site_views: null }],
		);
		const result = fetch_reactions_summary(client, '/posts/a');
		expect(result?.per_1k_views).toBeNull();
		expect(result?.site_per_1k_views).toBeNull();
	});
});
