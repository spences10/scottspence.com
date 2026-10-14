import {
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '#lib/cache/server-cache.js';
import type { SqliteClient } from '#lib/sqlite/client.js';

/** First day with daily rollups; earlier posts have no launch curve */
export const DAILY_DATA_START = '2025-12-28';
/** Days of cumulative views compared between launches */
export const LAUNCH_DAYS = 30;
/** Posts first viewed within this many days form the comparison cohort */
export const LAUNCH_COHORT_DAYS = 365;

export interface DailyViews {
	date: string;
	views: number;
}

export interface LaunchCurve {
	/** Cumulative views by day since first view, null past the last day of data */
	cumulative: (number | null)[];
	first_view_date: string;
	days_live: number;
}

export const add_days = (date: string, days: number) =>
	new Date(Date.parse(date + 'T00:00:00Z') + days * 864e5)
		.toISOString()
		.slice(0, 10);

const days_between = (from: string, to: string) =>
	Math.round(
		(Date.parse(to + 'T00:00:00Z') -
			Date.parse(from + 'T00:00:00Z')) /
			864e5,
	);

/**
 * Cumulative views from the first day with views
 * Counting from the first view, not the post date, because posts are
 * often dated before they go live
 */
export const build_launch_curve = (
	rows: DailyViews[],
	last_date: string,
	days = LAUNCH_DAYS,
): LaunchCurve | null => {
	const by_date = new Map(rows.map((r) => [r.date, r.views]));
	const first = rows
		.filter((r) => r.views > 0)
		.map((r) => r.date)
		.sort()[0];
	if (!first || first > last_date) return null;

	const days_live = days_between(first, last_date) + 1;
	const cumulative: (number | null)[] = [];
	let total = 0;
	for (let i = 0; i < days; i++) {
		if (i >= days_live) {
			cumulative.push(null);
			continue;
		}
		total += by_date.get(add_days(first, i)) ?? 0;
		cumulative.push(total);
	}
	return { cumulative, first_view_date: first, days_live };
};

const median = (values: number[]): number | null => {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2
		? sorted[mid]
		: (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Median cumulative views per day, from launches with a full window
 * so the line doesn't dip as young posts drop out
 */
export const median_launch_curve = (
	curves: LaunchCurve[],
	days = LAUNCH_DAYS,
): (number | null)[] => {
	const complete = curves.filter((c) => c.days_live >= days);
	return Array.from({ length: days }, (_, i) =>
		median(complete.map((c) => c.cumulative[i] as number)),
	);
};

/**
 * 1-based rank of `curve` against the cohort at the same day since launch
 */
export const rank_launch = (
	curve: LaunchCurve,
	cohort: LaunchCurve[],
	days = LAUNCH_DAYS,
): { day: number; rank: number; of: number } => {
	const day = Math.min(curve.days_live, days) - 1;
	const value = curve.cumulative[day] ?? 0;
	const others = cohort
		.filter((c) => c !== curve)
		.map((c) => c.cumulative[day])
		.filter((v): v is number => v != null);
	return {
		day,
		rank: others.filter((v) => v > value).length + 1,
		of: others.length + 1,
	};
};

export interface CohortPostViews {
	title: string;
	pub: string;
	rows: DailyViews[];
}

/**
 * Daily views for posts first published within the cohort window
 * Keyed by slug; rows run up to 120 days past the post date to allow
 * for posts that go live after their date
 */
export const fetch_launch_cohort_views = (
	client: SqliteClient,
	since: string,
): Map<string, CohortPostViews> => {
	const result = client.execute({
		sql: `
			SELECT p.slug, p.title, date(p.date) AS pub, d.date, d.views
			FROM posts p
			JOIN analytics_daily d
				ON d.pathname = '/posts/' || p.slug
				AND d.date >= date(p.date)
				AND d.date < date(p.date, '+120 days')
			WHERE p.is_private = 0
				AND date(p.date) >= ?
		`,
		args: [since],
	});

	const by_slug = new Map<string, CohortPostViews>();
	for (const row of result.rows) {
		const slug = String(row.slug);
		const post = by_slug.get(slug) ?? {
			title: String(row.title),
			pub: String(row.pub),
			rows: [],
		};
		post.rows.push({
			date: String(row.date),
			views: Number(row.views),
		});
		by_slug.set(slug, post);
	}
	return by_slug;
};

export interface Launch {
	slug: string;
	title: string;
	pub: string;
	curve: LaunchCurve;
}

export interface LaunchCohort {
	last_date: string;
	launches: Launch[];
	median: (number | null)[];
}

/**
 * Launch curves for every post first published in the last year
 * Shared by the post modal and /stats, so cached once
 */
export const get_launch_cohort = (
	client: SqliteClient,
): LaunchCohort | null => {
	const cache_key = 'post_analytics:launch_cohort';
	const cached = get_from_cache<LaunchCohort>(
		cache_key,
		CACHE_DURATIONS.post_analytics.launch_cohort,
	);
	if (cached) return cached;

	const last_date = fetch_last_daily_date(client);
	if (!last_date) return null;

	const window_start = add_days(last_date, -LAUNCH_COHORT_DAYS);
	const since =
		window_start > DAILY_DATA_START ? window_start : DAILY_DATA_START;
	const views = fetch_launch_cohort_views(client, since);

	const launches: Launch[] = [];
	for (const [slug, { title, pub, rows }] of views) {
		const curve = build_launch_curve(rows, last_date);
		if (curve) launches.push({ slug, title, pub, curve });
	}

	const cohort: LaunchCohort = {
		last_date,
		launches,
		median: median_launch_curve(launches.map((l) => l.curve)),
	};
	set_cache(cache_key, cohort);
	return cohort;
};

export const fetch_last_daily_date = (
	client: SqliteClient,
): string | null => {
	const result = client.execute(
		'SELECT MAX(date) AS last_date FROM analytics_daily',
	);
	const last = result.rows[0]?.last_date;
	return last ? String(last) : null;
};

export interface MonthlyHistoryRow {
	month: string;
	views: number;
	visitors: number;
}

export const fetch_monthly_history = (
	client: SqliteClient,
	pathname: string,
): MonthlyHistoryRow[] => {
	const result = client.execute({
		sql: `
			SELECT year_month, views, unique_visitors
			FROM analytics_monthly
			WHERE pathname = ?
			ORDER BY year_month
		`,
		args: [pathname],
	});
	return result.rows.map((row) => ({
		month: String(row.year_month),
		views: Number(row.views) || 0,
		visitors: Number(row.unique_visitors) || 0,
	}));
};

export interface ReactionsSummary {
	total: number;
	by_type: Record<string, number>;
	per_1k_views: number | null;
	site_per_1k_views: number | null;
}

export const fetch_reactions_summary = (
	client: SqliteClient,
	pathname: string,
): ReactionsSummary | null => {
	const result = client.execute({
		sql: `
			SELECT reaction_type, count
			FROM reactions
			WHERE post_url = ?
		`,
		args: [pathname],
	});
	if (result.rows.length === 0) return null;

	const by_type: Record<string, number> = {};
	for (const row of result.rows) {
		by_type[String(row.reaction_type)] = Number(row.count);
	}
	const total = Object.values(by_type).reduce((a, b) => a + b, 0);

	const views_result = client.execute({
		sql: `
			SELECT
				(SELECT views FROM analytics_all_time WHERE pathname = ?) AS post_views,
				(SELECT SUM(count) FROM reactions) AS site_reactions,
				(SELECT SUM(views) FROM analytics_all_time WHERE pathname LIKE '/posts/%') AS site_views
		`,
		args: [pathname],
	});
	const row = views_result.rows[0] ?? {};
	const post_views = Number(row.post_views) || 0;
	const site_views = Number(row.site_views) || 0;

	return {
		total,
		by_type,
		per_1k_views: post_views ? (total / post_views) * 1000 : null,
		site_per_1k_views: site_views
			? (Number(row.site_reactions) / site_views) * 1000
			: null,
	};
};

/** Days in each half of the risers and fallers comparison */
export const MOVERS_WINDOW_DAYS = 90;

export interface PostMoverRow {
	slug: string;
	title: string;
	pub: string;
	recent: number;
	previous: number;
}

/**
 * Post views in the last window against the window before it
 * Posts published inside either window are left out, otherwise
 * every new post shows as a riser
 */
export const fetch_post_movers = (
	client: SqliteClient,
	last_date: string,
	window_days = MOVERS_WINDOW_DAYS,
): PostMoverRow[] => {
	const split = add_days(last_date, -window_days);
	const start = add_days(last_date, -window_days * 2);
	const result = client.execute({
		sql: `
			SELECT
				p.slug,
				p.title,
				date(p.date) AS pub,
				SUM(CASE WHEN d.date > ? THEN d.views ELSE 0 END) AS recent,
				SUM(CASE WHEN d.date <= ? THEN d.views ELSE 0 END) AS previous
			FROM analytics_daily d
			JOIN posts p ON d.pathname = '/posts/' || p.slug
			WHERE d.date > ? AND d.date <= ?
				AND p.is_private = 0
				AND date(p.date) <= ?
			GROUP BY p.slug
		`,
		args: [split, split, start, last_date, start],
	});
	return result.rows.map((row) => ({
		slug: String(row.slug),
		title: String(row.title),
		pub: String(row.pub),
		recent: Number(row.recent) || 0,
		previous: Number(row.previous) || 0,
	}));
};

/**
 * Biggest rises and falls by change in views
 */
export const pick_movers = (rows: PostMoverRow[], count = 8) => {
	const with_change = rows.map((r) => ({
		...r,
		change: r.recent - r.previous,
	}));
	return {
		risers: with_change
			.filter((r) => r.change > 0)
			.sort((a, b) => b.change - a.change)
			.slice(0, count),
		fallers: with_change
			.filter((r) => r.change < 0)
			.sort((a, b) => a.change - b.change)
			.slice(0, count),
	};
};
