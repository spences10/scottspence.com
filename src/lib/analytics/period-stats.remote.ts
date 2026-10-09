import {
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '#lib/cache/server-cache.js';
import { sqlite_client } from '#lib/sqlite/client.js';
import { query } from '$app/server';
import * as v from 'valibot';
import { get_blocked_domains_array } from './blocked-domains';
import { BOT_THRESHOLDS } from './bot-thresholds';
import {
	format_period_stats,
	get_period_boundaries,
	get_previous_window,
	summarise_visits,
	to_counts_lookup,
	VISIT_TIMEOUT_MS,
	type FilterMode,
	type PeriodComparison,
	type PeriodCounts,
	type PeriodStats,
	type StatsPeriod,
	type VisitRow,
	type VisitStats,
} from './period-stats.helpers';
import { aggregate_referrers } from './referrer-normalisation';

const DAY_MS = 24 * 60 * 60 * 1000;

// Re-export types for consumers
export type {
	FilterMode,
	PeriodComparison,
	PeriodCounts,
	PeriodStats,
	StatsPeriod,
} from './period-stats.helpers';

/**
 * Get visitor hashes that exceed behaviour thresholds for a period
 * These are bots spoofing real user agents
 */
const get_behaviour_bot_hashes = (
	start: number,
	end: number,
): Set<string> => {
	// Get visitors exceeding per-path threshold
	const per_path_result = sqlite_client.execute({
		sql: `SELECT DISTINCT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash, path
			HAVING COUNT(*) > ?`,
		args: [start, end, BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY],
	});

	// Get visitors exceeding total threshold
	const total_result = sqlite_client.execute({
		sql: `SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash
			HAVING COUNT(*) > ?`,
		args: [start, end, BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY],
	});

	// Combine both sets
	const hashes = new Set<string>();
	per_path_result.rows.forEach((r) =>
		hashes.add(r.visitor_hash as string),
	);
	total_result.rows.forEach((r) =>
		hashes.add(r.visitor_hash as string),
	);
	return hashes;
};

/**
 * Build the bot WHERE clause for a filter mode
 * - humans: excludes flagged bots AND behaviour bots
 * - bots: only detected bots (flagged + behaviour)
 * - all: no filtering
 */
const build_bot_filter = (
	mode: FilterMode,
	bot_hashes: string[],
): { bot_condition: string; bot_args: (string | number)[] } => {
	const placeholders = bot_hashes.map(() => '?').join(',');
	if (mode === 'humans') {
		return bot_hashes.length > 0
			? {
					bot_condition: `AND is_bot = 0 AND visitor_hash NOT IN (${placeholders})`,
					bot_args: bot_hashes,
				}
			: { bot_condition: 'AND is_bot = 0', bot_args: [] };
	}
	if (mode === 'bots') {
		return bot_hashes.length > 0
			? {
					bot_condition: `AND (is_bot = 1 OR visitor_hash IN (${placeholders}))`,
					bot_args: bot_hashes,
				}
			: { bot_condition: 'AND is_bot = 1', bot_args: [] };
	}
	return { bot_condition: '', bot_args: [] };
};

/**
 * Referrers from raw events: Direct plus normalised sources
 * (groups Google variants, filters internal and blocked domains)
 */
const get_raw_referrers = (
	start: number,
	end: number,
	bot_condition: string,
	bot_args: (string | number)[],
): { referrer: string; views: number; visitors: number }[] => {
	// Direct traffic (null/empty referrer)
	const direct_result = sqlite_client.execute({
		sql: `SELECT
			COUNT(*) as views,
			COUNT(DISTINCT visitor_hash) as visitors
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ?
			${bot_condition}
			AND (referrer IS NULL OR referrer = '')`,
		args: [start, end, ...bot_args],
	});
	const direct_stats = {
		referrer: 'Direct',
		views: (direct_result.rows[0]?.views as number) ?? 0,
		visitors: (direct_result.rows[0]?.visitors as number) ?? 0,
	};

	// Fetch more than we need since grouping will consolidate
	const blocked_domains = get_blocked_domains_array();
	const blocked_placeholders = blocked_domains
		.map(() => `AND referrer NOT LIKE ?`)
		.join(' ');
	const blocked_args = blocked_domains.map((d) => `%${d}%`);
	const referrers_result = sqlite_client.execute({
		sql: `SELECT
			referrer,
			COUNT(*) as views,
			COUNT(DISTINCT visitor_hash) as visitors
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ?
			${bot_condition}
			AND referrer IS NOT NULL
			AND referrer != ''
			${blocked_placeholders}
		GROUP BY referrer
		ORDER BY visitors DESC
		LIMIT 100`,
		args: [start, end, ...bot_args, ...blocked_args],
	});
	const raw_referrers = referrers_result.rows as {
		referrer: string;
		views: number;
		visitors: number;
	}[];

	return [direct_stats, ...aggregate_referrers(raw_referrers)].sort(
		(a, b) => b.visitors - a.visitors,
	);
};

/**
 * Group raw events by a column into a lookup of views and visitors
 */
const get_raw_counts_by = (
	column: 'path' | 'country' | 'browser' | 'device_type',
	start: number,
	end: number,
	bot_condition: string,
	bot_args: (string | number)[],
): Record<string, PeriodCounts> => {
	const result = sqlite_client.execute({
		sql: `SELECT
			${column} as key,
			COUNT(*) as views,
			COUNT(DISTINCT visitor_hash) as visitors
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ?
			${bot_condition}
			AND ${column} IS NOT NULL
			AND ${column} != ''
		GROUP BY ${column}`,
		args: [start, end, ...bot_args],
	});
	return to_counts_lookup(
		result.rows as { key: string; views: number; visitors: number }[],
	);
};

/**
 * Visits from raw page views: a visitor's views are split into visits
 * wherever the gap between them exceeds VISIT_TIMEOUT_MS
 */
const get_visit_stats = (
	start: number,
	end: number,
	bot_condition: string,
	bot_args: (string | number)[],
): VisitStats => {
	const result = sqlite_client.execute({
		sql: `WITH page_views AS (
			SELECT id, visitor_hash, path, created_at,
				LAG(created_at) OVER (
					PARTITION BY visitor_hash ORDER BY created_at, id
				) AS previous_at
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				AND event_type = 'page_view'
				${bot_condition}
		),
		numbered AS (
			SELECT id, visitor_hash, path, created_at,
				SUM(previous_at IS NULL OR created_at - previous_at > ?) OVER (
					PARTITION BY visitor_hash ORDER BY created_at, id
				) AS visit_number
			FROM page_views
		)
		SELECT DISTINCT
			visitor_hash,
			visit_number,
			COUNT(*) OVER visit AS pages,
			MAX(created_at) OVER visit - MIN(created_at) OVER visit AS duration_ms,
			FIRST_VALUE(path) OVER (
				PARTITION BY visitor_hash, visit_number ORDER BY created_at, id
			) AS entry_path,
			FIRST_VALUE(path) OVER (
				PARTITION BY visitor_hash, visit_number
				ORDER BY created_at DESC, id DESC
			) AS exit_path
		FROM numbered
		WINDOW visit AS (PARTITION BY visitor_hash, visit_number)`,
		args: [start, end, ...bot_args, VISIT_TIMEOUT_MS],
	});
	return summarise_visits(result.rows as VisitRow[]);
};

/**
 * Stats for the period before the selected one, used for deltas
 *
 * - today: the same time window yesterday, from raw events (all breakdowns)
 * - yesterday: the day before, from the daily rollup (humans only)
 * - week/month/year: the preceding window, from rollups (humans only)
 *
 * Returns null where there is nothing comparable to diff against
 */
const get_previous_stats = (
	period: StatsPeriod,
	mode: FilterMode,
	current: { start: number; end: number },
): PeriodComparison | null => {
	if (period === 'today') {
		const start = current.start - DAY_MS;
		const end = current.end - DAY_MS;
		const { bot_condition, bot_args } = build_bot_filter(mode, [
			...get_behaviour_bot_hashes(start, end),
		]);
		const totals = sqlite_client.execute({
			sql: `SELECT
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as unique_visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ? ${bot_condition}`,
			args: [start, end, ...bot_args],
		}).rows[0];
		const by = (
			column: 'path' | 'country' | 'browser' | 'device_type',
		) =>
			get_raw_counts_by(column, start, end, bot_condition, bot_args);

		const visits = get_visit_stats(
			start,
			end,
			bot_condition,
			bot_args,
		);

		return {
			label: 'the same time yesterday',
			visits: {
				bounce_rate: visits.bounce_rate,
				avg_duration_ms: visits.avg_duration_ms,
			},
			views: (totals?.views as number) ?? 0,
			unique_visitors: (totals?.unique_visitors as number) ?? 0,
			pages: by('path'),
			countries: by('country'),
			browsers: by('browser'),
			devices: by('device_type'),
			referrers: to_counts_lookup(
				get_raw_referrers(start, end, bot_condition, bot_args).map(
					({ referrer, ...counts }) => ({ key: referrer, ...counts }),
				),
			),
		};
	}

	// Rollups only hold human traffic per page
	if (mode !== 'humans') return null;

	const to_date = (ms: number) =>
		new Date(ms).toISOString().split('T')[0];
	const no_breakdowns = {
		countries: null,
		browsers: null,
		devices: null,
		referrers: null,
		visits: null,
	};

	if (period === 'yesterday') {
		const result = sqlite_client.execute({
			sql: `SELECT pathname as key, views, unique_visitors as visitors
			FROM analytics_daily WHERE date = ?`,
			args: [to_date(current.start - DAY_MS)],
		});
		const rows = result.rows as {
			key: string;
			views: number;
			visitors: number;
		}[];
		if (rows.length === 0) return null;
		return {
			label: 'the day before',
			views: rows.reduce((sum, row) => sum + row.views, 0),
			// The rollup has per-page uniques only, which can't be summed
			// into the site-wide distinct count yesterday shows
			unique_visitors: null,
			pages: to_counts_lookup(rows),
			...no_breakdowns,
		};
	}

	let rows: { key: string; views: number; visitors: number }[];
	if (period === 'year') {
		const start_month = new Date(current.start);
		const previous_month = new Date(start_month);
		previous_month.setUTCFullYear(
			previous_month.getUTCFullYear() - 1,
		);
		rows = sqlite_client.execute({
			sql: `SELECT pathname as key,
				SUM(views) as views,
				SUM(unique_visitors) as visitors
			FROM analytics_monthly
			WHERE year_month >= ? AND year_month < ?
			GROUP BY pathname`,
			args: [
				previous_month.toISOString().slice(0, 7),
				start_month.toISOString().slice(0, 7),
			],
		}).rows as typeof rows;
	} else {
		// The selected window is N full days plus today so far, so the
		// previous one is the N days before it plus the same share of
		// the day before those
		const days = period === 'week' ? 7 : 30;
		const today_start = new Date(
			to_date(current.end) + 'T00:00:00Z',
		).getTime();
		const {
			partial_date,
			partial_weight,
			from_date,
			to_date: until,
		} = get_previous_window(
			to_date(current.start),
			days,
			(current.end - today_start) / DAY_MS,
		);
		rows = sqlite_client.execute({
			sql: `SELECT pathname as key,
				SUM(views * CASE WHEN date = ? THEN ? ELSE 1 END) as views,
				SUM(unique_visitors * CASE WHEN date = ? THEN ? ELSE 1 END) as visitors
			FROM analytics_daily
			WHERE date >= ? AND date < ?
			GROUP BY pathname`,
			args: [
				partial_date,
				partial_weight,
				partial_date,
				partial_weight,
				from_date,
				until,
			],
		}).rows as typeof rows;
	}

	if (rows.length === 0) return null;
	const rounded = rows.map((row) => ({
		key: row.key,
		views: Math.round(row.views),
		visitors: Math.round(row.visitors),
	}));
	return {
		label:
			period === 'week'
				? 'the previous 7 days'
				: period === 'month'
					? 'the previous 30 days'
					: 'the previous 12 months',
		views: Math.round(rows.reduce((sum, row) => sum + row.views, 0)),
		unique_visitors: Math.round(
			rows.reduce((sum, row) => sum + row.visitors, 0),
		),
		pages: to_counts_lookup(rounded),
		...no_breakdowns,
	};
};

/**
 * Get analytics stats for a specific time period
 * Queries analytics_events table with time filter and bot filtering
 *
 * filter_mode:
 * - 'humans' (default): excludes flagged bots AND behaviour bots
 * - 'bots': shows only detected bots (flagged + behaviour)
 * - 'all': raw unfiltered data
 */
export const get_period_stats = query(
	v.object({
		period: v.picklist([
			'today',
			'yesterday',
			'week',
			'month',
			'year',
		]),
		filter_mode: v.optional(
			v.picklist(['humans', 'bots', 'all']),
			'humans',
		),
	}),
	({ period, filter_mode }): PeriodStats => {
		const mode = filter_mode as FilterMode;

		// Check cache first - key includes period + filter mode
		const cache_key = `period_stats_${period}_${mode}`;
		const cached = get_from_cache<PeriodStats>(
			cache_key,
			CACHE_DURATIONS.period_stats,
		);
		if (cached) {
			return cached;
		}

		const { start, end } = get_period_boundaries(
			period as StatsPeriod,
		);

		// Get behaviour bot hashes for this period
		const behaviour_bots = get_behaviour_bot_hashes(start, end);
		const bot_hashes = [...behaviour_bots];

		// Build WHERE clause based on filter mode
		const { bot_condition, bot_args } = build_bot_filter(
			mode,
			bot_hashes,
		);

		// For longer periods, use rollup tables + today's raw events
		// Rollup data is bot-filtered (is_bot = 0) — for 'all' mode we
		// add bot totals back on top of the rollup numbers
		const use_rollup =
			(period === 'week' ||
				period === 'month' ||
				period === 'year') &&
			(mode === 'humans' || mode === 'all');

		const today_date = new Date().toISOString().split('T')[0];
		const today_utc_start = new Date(
			today_date + 'T00:00:00Z',
		).getTime();

		// Total views and unique visitors
		let totals: { views: number; unique_visitors: number };

		if (use_rollup) {
			let rollup_views = 0;
			let rollup_uv = 0;

			if (period === 'year') {
				const start_month = new Date(start).toISOString().slice(0, 7);
				const result = sqlite_client.execute({
					sql: `SELECT COALESCE(SUM(views), 0) as views,
						COALESCE(SUM(unique_visitors), 0) as unique_visitors
					FROM analytics_monthly WHERE year_month >= ?`,
					args: [start_month],
				});
				rollup_views = (result.rows[0]?.views as number) ?? 0;
				rollup_uv = (result.rows[0]?.unique_visitors as number) ?? 0;
			} else {
				const start_date = new Date(start)
					.toISOString()
					.split('T')[0];
				const result = sqlite_client.execute({
					sql: `SELECT COALESCE(SUM(views), 0) as views,
						COALESCE(SUM(unique_visitors), 0) as unique_visitors
					FROM analytics_daily WHERE date >= ? AND date < ?`,
					args: [start_date, today_date],
				});
				rollup_views = (result.rows[0]?.views as number) ?? 0;
				rollup_uv = (result.rows[0]?.unique_visitors as number) ?? 0;
			}

			// Add today's raw events (filter bots unless 'all' mode)
			const today_bot_filter = mode === 'all' ? '' : 'AND is_bot = 0';
			const today_result = sqlite_client.execute({
				sql: `SELECT COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as unique_visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? ${today_bot_filter}`,
				args: [today_utc_start, end],
			});

			totals = {
				views:
					rollup_views +
					((today_result.rows[0]?.views as number) ?? 0),
				unique_visitors:
					rollup_uv +
					((today_result.rows[0]?.unique_visitors as number) ?? 0),
			};
		} else {
			const totals_result = sqlite_client.execute({
				sql: `SELECT
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as unique_visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? ${bot_condition}`,
				args: [start, end, ...bot_args],
			});
			totals = {
				views: (totals_result.rows[0]?.views as number) ?? 0,
				unique_visitors:
					(totals_result.rows[0]?.unique_visitors as number) ?? 0,
			};
		}

		// Bot totals (always calculate for display)
		let bot_totals = { views: 0, visitors: 0 };
		if (bot_hashes.length > 0) {
			const placeholders = bot_hashes.map(() => '?').join(',');
			const bot_result = sqlite_client.execute({
				sql: `SELECT
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ?
				AND (is_bot = 1 OR visitor_hash IN (${placeholders}))`,
				args: [start, end, ...bot_hashes],
			});
			bot_totals = {
				views: (bot_result.rows[0]?.views as number) ?? 0,
				visitors: (bot_result.rows[0]?.visitors as number) ?? 0,
			};
		} else {
			// Just flagged bots
			const bot_result = sqlite_client.execute({
				sql: `SELECT
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? AND is_bot = 1`,
				args: [start, end],
			});
			bot_totals = {
				views: (bot_result.rows[0]?.views as number) ?? 0,
				visitors: (bot_result.rows[0]?.visitors as number) ?? 0,
			};
		}

		// For 'all' mode with rollups, the rollup data is humans-only
		// so add bot totals on top to get the true combined number
		if (use_rollup && mode === 'all') {
			totals.views += bot_totals.views;
			totals.unique_visitors += bot_totals.visitors;
		}

		// Top pages
		let top_pages: {
			path: string;
			views: number;
			visitors: number;
		}[];

		if (use_rollup) {
			let rollup_pages_result;
			if (period === 'year') {
				const start_month = new Date(start).toISOString().slice(0, 7);
				rollup_pages_result = sqlite_client.execute({
					sql: `SELECT pathname as path,
						SUM(views) as views,
						SUM(unique_visitors) as visitors
					FROM analytics_monthly WHERE year_month >= ?
					GROUP BY pathname`,
					args: [start_month],
				});
			} else {
				const start_date = new Date(start)
					.toISOString()
					.split('T')[0];
				rollup_pages_result = sqlite_client.execute({
					sql: `SELECT pathname as path,
						SUM(views) as views,
						SUM(unique_visitors) as visitors
					FROM analytics_daily WHERE date >= ? AND date < ?
					GROUP BY pathname`,
					args: [start_date, today_date],
				});
			}

			// Today's raw events (filter bots unless 'all' mode)
			const today_bot_filter = mode === 'all' ? '' : 'AND is_bot = 0';
			const today_pages_result = sqlite_client.execute({
				sql: `SELECT path,
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? ${today_bot_filter}
				GROUP BY path`,
				args: [today_utc_start, end],
			});

			// Merge rollup + today
			const pages_map = new Map<
				string,
				{ views: number; visitors: number }
			>();
			for (const row of rollup_pages_result.rows) {
				pages_map.set(row.path as string, {
					views: row.views as number,
					visitors: row.visitors as number,
				});
			}
			for (const row of today_pages_result.rows) {
				const existing = pages_map.get(row.path as string);
				if (existing) {
					existing.views += row.views as number;
					existing.visitors += row.visitors as number;
				} else {
					pages_map.set(row.path as string, {
						views: row.views as number,
						visitors: row.visitors as number,
					});
				}
			}
			top_pages = [...pages_map.entries()]
				.map(([path, stats]) => ({ path, ...stats }))
				.sort((a, b) => b.visitors - a.visitors);
		} else {
			const pages_result = sqlite_client.execute({
				sql: `SELECT
					path,
					COUNT(*) as views,
					COUNT(DISTINCT visitor_hash) as visitors
				FROM analytics_events
				WHERE created_at >= ? AND created_at < ? ${bot_condition}
				GROUP BY path
				ORDER BY visitors DESC`,
				args: [start, end, ...bot_args],
			});
			top_pages = pages_result.rows as {
				path: string;
				views: number;
				visitors: number;
			}[];
		}

		// Countries
		const countries_result = sqlite_client.execute({
			sql: `SELECT
				country,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				${bot_condition}
				AND country IS NOT NULL
				AND country != ''
			GROUP BY country
			ORDER BY visitors DESC`,
			args: [start, end, ...bot_args],
		});
		const countries = countries_result.rows as {
			country: string;
			views: number;
			visitors: number;
		}[];

		// Browsers
		const browsers_result = sqlite_client.execute({
			sql: `SELECT
				browser,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				${bot_condition}
				AND browser IS NOT NULL
			GROUP BY browser
			ORDER BY visitors DESC
			LIMIT 5`,
			args: [start, end, ...bot_args],
		});
		const browsers = browsers_result.rows as {
			browser: string;
			views: number;
			visitors: number;
		}[];

		// Devices
		const devices_result = sqlite_client.execute({
			sql: `SELECT
				device_type,
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as visitors
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
				${bot_condition}
				AND device_type IS NOT NULL
			GROUP BY device_type
			ORDER BY visitors DESC`,
			args: [start, end, ...bot_args],
		});
		const devices = devices_result.rows as {
			device_type: string;
			views: number;
			visitors: number;
		}[];

		// Referrers (Direct + normalised sources), top 10
		const referrers = get_raw_referrers(
			start,
			end,
			bot_condition,
			bot_args,
		).slice(0, 10);

		// Previous period, for the deltas shown next to each number
		const previous = get_previous_stats(period as StatsPeriod, mode, {
			start,
			end,
		});

		// Bounce rate, time on site and entry/exit pages need raw events,
		// which only cover today and yesterday
		const visits =
			period === 'today' || period === 'yesterday'
				? get_visit_stats(start, end, bot_condition, bot_args)
				: null;

		const result = format_period_stats(
			period as StatsPeriod,
			mode,
			totals,
			bot_totals,
			top_pages,
			countries,
			browsers,
			devices,
			referrers,
			previous,
			visits,
		);

		// Cache the result
		set_cache(cache_key, result);
		return result;
	},
);
