import { BOT_THRESHOLDS } from '#lib/analytics/bot-thresholds.js';
import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '#lib/cache/server-cache.js';
import { sqlite_client } from '#lib/sqlite/client.js';
import { query } from '$app/server';
import * as v from 'valibot';
import {
	fetch_monthly_history,
	fetch_reactions_summary,
	get_launch_cohort,
	rank_launch,
} from './post-analytics.helpers';

interface PostAnalyticsRow {
	pageviews: number;
	uniques: number;
	visits: number;
}

const empty_analytics: PostAnalytics = {
	daily: null,
	monthly: null,
	yearly: null,
};

/**
 * Get post analytics from local rollup tables
 * Replaces Fathom API with local analytics_events + rollup tables
 */
export const get_post_analytics = query(
	v.string(),
	(slug: string): PostAnalytics => {
		if (BYPASS_DB_READS.post_analytics) {
			return empty_analytics;
		}

		const cache_key = `post_analytics:${slug}`;
		const cached = get_from_cache<PostAnalytics>(
			cache_key,
			CACHE_DURATIONS.post_analytics.day,
		);
		if (cached) return cached;

		try {
			const pathname = `/posts/${slug}`;

			const daily = fetch_today_stats(pathname);
			const monthly = fetch_month_stats(pathname);
			const yearly = fetch_year_stats(pathname);
			const history = fetch_monthly_history(sqlite_client, pathname);
			const launch = fetch_launch(slug);
			const reactions = fetch_reactions_summary(
				sqlite_client,
				pathname,
			);

			const result: PostAnalytics = {
				daily,
				monthly,
				yearly,
				history,
				launch,
				reactions,
			};
			set_cache(cache_key, result);
			return result;
		} catch (error) {
			console.warn('Database unavailable for post analytics:', error);
			return empty_analytics;
		}
	},
);

const fetch_launch = (slug: string): PostLaunch | null => {
	const cohort = get_launch_cohort(sqlite_client);
	const curve = cohort?.launches.find((l) => l.slug === slug)?.curve;
	if (!cohort || !curve) return null;

	const { day, rank, of } = rank_launch(
		curve,
		cohort.launches.map((l) => l.curve),
	);
	return {
		cumulative: curve.cumulative,
		median: cohort.median,
		days_live: curve.days_live,
		day,
		rank,
		cohort_size: of,
	};
};

/**
 * Today's stats from analytics_events with bot filtering CTE
 */
const fetch_today_stats = (
	pathname: string,
): PostAnalyticsRow | null => {
	const today_start = new Date();
	today_start.setHours(0, 0, 0, 0);
	const today_timestamp = today_start.getTime();

	const result = sqlite_client.execute({
		sql: `
			WITH bad_visitors AS (
				SELECT DISTINCT visitor_hash
				FROM analytics_events
				WHERE created_at >= ?
				GROUP BY visitor_hash, path
				HAVING COUNT(*) > ?
				UNION
				SELECT visitor_hash
				FROM analytics_events
				WHERE created_at >= ?
				GROUP BY visitor_hash
				HAVING COUNT(*) > ?
			)
			SELECT
				COUNT(*) as views,
				COUNT(DISTINCT visitor_hash) as uniques
			FROM analytics_events
			WHERE path = ?
				AND created_at >= ?
				AND is_bot = 0
				AND visitor_hash NOT IN (SELECT visitor_hash FROM bad_visitors)
		`,
		args: [
			today_timestamp,
			BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY,
			today_timestamp,
			BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY,
			pathname,
			today_timestamp,
		],
	});

	const row = result.rows[0];
	if (!row || (row.views === 0 && row.uniques === 0)) return null;

	return {
		pageviews: Number(row.views),
		uniques: Number(row.uniques),
		visits: Number(row.uniques),
	};
};

/**
 * This month's stats from analytics_monthly rollup
 */
const fetch_month_stats = (
	pathname: string,
): PostAnalyticsRow | null => {
	const current_month = new Date().toISOString().slice(0, 7);

	const result = sqlite_client.execute({
		sql: `
			SELECT
				SUM(views) as views,
				SUM(unique_visitors) as uniques
			FROM analytics_monthly
			WHERE pathname = ?
				AND year_month = ?
		`,
		args: [pathname, current_month],
	});

	const row = result.rows[0];
	if (!row || (!row.views && !row.uniques)) return null;

	return {
		pageviews: Number(row.views) || 0,
		uniques: Number(row.uniques) || 0,
		visits: Number(row.uniques) || 0,
	};
};

/**
 * This year's stats from analytics_yearly rollup
 */
const fetch_year_stats = (
	pathname: string,
): PostAnalyticsRow | null => {
	const current_year = new Date().getFullYear().toString();

	const result = sqlite_client.execute({
		sql: `
			SELECT
				SUM(views) as views,
				SUM(unique_visitors) as uniques
			FROM analytics_yearly
			WHERE pathname = ?
				AND year = ?
		`,
		args: [pathname, current_year],
	});

	const row = result.rows[0];
	if (!row || (!row.views && !row.uniques)) return null;

	return {
		pageviews: Number(row.views) || 0,
		uniques: Number(row.uniques) || 0,
		visits: Number(row.uniques) || 0,
	};
};
