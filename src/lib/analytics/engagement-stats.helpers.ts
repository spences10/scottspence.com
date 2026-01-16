/**
 * Engagement stats helpers - testable pure functions
 * For calculating click-through/engagement rates per page
 */

import type { StatsPeriod } from './period-stats.helpers'

export type EngagementSortMode = 'rate' | 'clicks'

export interface EngagementStat {
	path: string
	clicks: number
	human_views: number
	engagement_rate: number
}

export interface EngagementStats {
	pages: EngagementStat[]
	total_clicks: number
	total_human_views: number
	overall_engagement_rate: number
	period_label: string
}

export const ENGAGEMENT_PERIOD_LABELS: Record<StatsPeriod, string> = {
	today: 'Today',
	yesterday: 'Yesterday',
	week: 'This Week',
	month: 'This Month',
	year: 'This Year',
}

/**
 * Minimum views required for a page to appear in engagement stats
 * Prevents noisy data from low-traffic pages
 */
export const MIN_VIEWS_THRESHOLD = 5

/**
 * Calculate engagement rate as a percentage
 */
export const calculate_engagement_rate = (
	clicks: number,
	views: number,
): number => {
	if (views === 0) return 0
	return (clicks / views) * 100
}

/**
 * Build engagement stats from raw click and view data
 */
export const build_engagement_stats = (
	clicks_by_path: Map<string, number>,
	views_by_path: Map<string, number>,
	period: StatsPeriod,
	min_views: number = MIN_VIEWS_THRESHOLD,
	max_results: number = 10,
): EngagementStats => {
	const pages: EngagementStat[] = []
	let total_clicks = 0
	let total_human_views = 0

	// Calculate engagement for each path with clicks
	for (const [path, clicks] of clicks_by_path) {
		const human_views = views_by_path.get(path) ?? 0

		total_clicks += clicks
		total_human_views += human_views

		if (human_views >= min_views) {
			pages.push({
				path,
				clicks,
				human_views,
				engagement_rate: calculate_engagement_rate(
					clicks,
					human_views,
				),
			})
		}
	}

	// Sort by engagement rate (highest first)
	const sorted_pages = pages
		.sort((a, b) => b.engagement_rate - a.engagement_rate)
		.slice(0, max_results)

	return {
		pages: sorted_pages,
		total_clicks,
		total_human_views,
		overall_engagement_rate: calculate_engagement_rate(
			total_clicks,
			total_human_views,
		),
		period_label: ENGAGEMENT_PERIOD_LABELS[period],
	}
}

/**
 * Format engagement rate for display
 */
export const format_engagement_rate = (rate: number): string => {
	if (rate >= 10) {
		return `${Math.round(rate)}%`
	}
	return `${rate.toFixed(1)}%`
}

/**
 * Sort engagement stats by specified mode
 */
export const sort_engagement_stats = (
	pages: EngagementStat[],
	mode: EngagementSortMode,
): EngagementStat[] => {
	return [...pages].sort((a, b) => {
		if (mode === 'clicks') {
			return b.clicks - a.clicks
		}
		return b.engagement_rate - a.engagement_rate
	})
}
