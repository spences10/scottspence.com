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
 * Roll a day's bot traffic into analytics_daily_bots
 * Runs after flag_bot_behaviour, so behaviour bots are already
 * flagged and is_bot covers everything /stats counts as a bot
 */
export const rollup_bots = (
	client: SqliteClient,
	date: string,
	start_ts: number,
	end_ts: number,
): { views: number; unique_visitors: number } => {
	const row = client.execute({
		sql: `SELECT COUNT(*) AS views,
			COUNT(DISTINCT visitor_hash) AS unique_visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? AND is_bot = 1`,
		args: [start_ts, end_ts],
	}).rows[0];
	const totals = {
		views: Number(row?.views) || 0,
		unique_visitors: Number(row?.unique_visitors) || 0,
	};
	client.batch([
		{
			sql: `INSERT OR REPLACE INTO analytics_daily_bots
				(date, views, unique_visitors) VALUES (?, ?, ?)`,
			args: [date, totals.views, totals.unique_visitors],
		},
	]);
	return totals;
};

/**
 * First day both the breakdown and bot rollups have data for, or null
 * before they run. The later of the two, so one note covers both.
 */
export const get_breakdowns_since = (
	client: SqliteClient,
): string | null => {
	const result = client.execute(
		`SELECT
			(SELECT MIN(date) FROM analytics_daily_breakdown) AS breakdowns,
			(SELECT MIN(date) FROM analytics_daily_bots) AS bots`,
	);
	const { breakdowns, bots } = result.rows[0] ?? {};
	if (!breakdowns || !bots) return null;
	return String(breakdowns > bots ? breakdowns : bots);
};
