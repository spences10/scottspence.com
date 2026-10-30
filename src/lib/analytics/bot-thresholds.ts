/**
 * Behaviour-based bot detection thresholds
 *
 * Based on Jan 2026 analysis of real traffic:
 * - 93.6% of humans have 1-2 hits/page
 * - Engaged multi-page visitors: ~1.6 hits/page
 * - Anyone >20 hits/page is almost certainly a bot
 *
 * Used by:
 * - flag-bot-behaviour.ts (nightly rollup)
 * - popular-posts.helpers.ts (today's query CTE)
 * - period-stats.remote.ts (stats page filtering)
 * - post-analytics.remote.ts (per-post modal)
 *
 * See docs/2026-analytics-migration.md for full analysis.
 */
export const BOT_THRESHOLDS = {
	/** Max hits per visitor per path per day - scraper hitting same page */
	MAX_HITS_PER_PATH_PER_DAY: 20,

	/** Max hits per visitor total per day - crawler visiting many pages */
	MAX_HITS_TOTAL_PER_DAY: 100,

	/** Max hits per visitor per path per hour - burst detection (not yet used) */
	MAX_HITS_PER_PATH_PER_HOUR: 10,

	/** Aggregate UA detection - homepage monitors */
	HOMEPAGE_PCT_THRESHOLD: 75,
	DIRECT_PCT_THRESHOLD: 75,
	MIN_VISITORS_FOR_AGGREGATE: 20,

	/** Aggregate UA detection - direct-only scrapers */
	MIN_VISITORS_FOR_DIRECT_ONLY: 15,

	/**
	 * Stale desktop Chrome - majors behind the day's current version.
	 * Chrome ships every 4 weeks, so 6 majors is roughly 6 months.
	 * Oct 2026: visitors on Chrome 124-131 made zero link clicks, and a
	 * bot fleet on Chrome 146 (10 behind) slipped past a limit of 12.
	 * 6 keeps real Chrome 150 visitors (6 behind 156) out of the flag.
	 */
	STALE_CHROME_MAJOR_VERSIONS: 6,

	/** Min referred human visitors on one Chrome major to trust it as current */
	MIN_VISITORS_FOR_CURRENT_CHROME: 30,
} as const;

export type BotThresholds = typeof BOT_THRESHOLDS;
