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
} as const

export type BotThresholds = typeof BOT_THRESHOLDS
