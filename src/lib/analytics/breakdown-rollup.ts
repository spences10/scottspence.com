import type { SqliteClient } from '#lib/sqlite/client.js';
import { normalise_referrer } from './referrer-normalisation';

/**
 * Daily breakdown rollups: referrers, countries, browsers and devices
 * per day, plus referrers per post. Raw events only live for 2 days,
 * so without these the breakdowns can't cover longer periods.
 */

export type BreakdownDimension =
	| 'referrer'
	| 'country'
	| 'browser'
	| 'device';

export interface BreakdownEvent {
	path: string;
	referrer: string | null;
	country: string | null;
	browser: string | null;
	device_type: string | null;
	visitor_hash: string;
}

export interface BreakdownRow {
	dimension: BreakdownDimension;
	value: string;
	views: number;
	unique_visitors: number;
}

export interface PostReferrerRow {
	pathname: string;
	referrer: string;
	views: number;
	unique_visitors: number;
}

/**
 * Referrer source as the stats panels show it: 'Direct' when there is
 * no referrer, null for internal domains (left out, as on /stats)
 */
export const referrer_source = (
	referrer: string | null,
): string | null =>
	!referrer ? 'Direct' : normalise_referrer(referrer);

type Tally = { views: number; visitors: Set<string> };

const add = (
	tallies: Map<string, Tally>,
	key: string,
	visitor_hash: string,
) => {
	const tally = tallies.get(key) ?? { views: 0, visitors: new Set() };
	tally.views += 1;
	tally.visitors.add(visitor_hash);
	tallies.set(key, tally);
};

const SEPARATOR = '\u0000';

/**
 * Group a day's human page views into breakdown rows, with exact
 * unique visitors per value
 */
export const group_breakdowns = (
	events: BreakdownEvent[],
): {
	breakdowns: BreakdownRow[];
	post_referrers: PostReferrerRow[];
} => {
	const site = new Map<string, Tally>();
	const posts = new Map<string, Tally>();

	for (const event of events) {
		const source = referrer_source(event.referrer);
		const values: [BreakdownDimension, string | null][] = [
			['referrer', source],
			['country', event.country],
			['browser', event.browser],
			['device', event.device_type],
		];
		for (const [dimension, value] of values) {
			if (value) {
				add(
					site,
					`${dimension}${SEPARATOR}${value}`,
					event.visitor_hash,
				);
			}
		}
		if (source && event.path.startsWith('/posts/')) {
			add(
				posts,
				`${event.path}${SEPARATOR}${source}`,
				event.visitor_hash,
			);
		}
	}

	const split = (key: string) =>
		key.split(SEPARATOR) as [string, string];
	return {
		breakdowns: [...site].map(([key, tally]) => {
			const [dimension, value] = split(key);
			return {
				dimension: dimension as BreakdownDimension,
				value,
				views: tally.views,
				unique_visitors: tally.visitors.size,
			};
		}),
		post_referrers: [...posts].map(([key, tally]) => {
			const [pathname, referrer] = split(key);
			return {
				pathname,
				referrer,
				views: tally.views,
				unique_visitors: tally.visitors.size,
			};
		}),
	};
};

/**
 * Roll a day's human events into the breakdown tables
 * Replaces any rows already there for that date, so reruns are safe
 */
export const rollup_breakdowns = (
	client: SqliteClient,
	date: string,
	start_ts: number,
	end_ts: number,
): { breakdowns: number; post_referrers: number } => {
	const events = client.execute({
		sql: `SELECT path, referrer, country, browser, device_type, visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? AND is_bot = 0`,
		args: [start_ts, end_ts],
	}).rows as unknown as BreakdownEvent[];

	const { breakdowns, post_referrers } = group_breakdowns(events);

	client.batch([
		{
			sql: 'DELETE FROM analytics_daily_breakdown WHERE date = ?',
			args: [date],
		},
		{
			sql: 'DELETE FROM analytics_daily_referrers WHERE date = ?',
			args: [date],
		},
		...breakdowns.map((row) => ({
			sql: `INSERT INTO analytics_daily_breakdown
				(date, dimension, value, views, unique_visitors)
				VALUES (?, ?, ?, ?, ?)`,
			args: [
				date,
				row.dimension,
				row.value,
				row.views,
				row.unique_visitors,
			],
		})),
		...post_referrers.map((row) => ({
			sql: `INSERT INTO analytics_daily_referrers
				(date, pathname, referrer, views, unique_visitors)
				VALUES (?, ?, ?, ?, ?)`,
			args: [
				date,
				row.pathname,
				row.referrer,
				row.views,
				row.unique_visitors,
			],
		})),
	]);

	return {
		breakdowns: breakdowns.length,
		post_referrers: post_referrers.length,
	};
};

/**
 * First day the breakdown rollup has data for, or null before it runs
 */
export const get_breakdowns_since = (
	client: SqliteClient,
): string | null => {
	const result = client.execute(
		'SELECT MIN(date) AS since FROM analytics_daily_breakdown',
	);
	const since = result.rows[0]?.since;
	return since ? String(since) : null;
};
