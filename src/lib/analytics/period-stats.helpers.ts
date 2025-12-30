/**
 * Period stats helpers - testable pure functions
 * For querying analytics_events by time period (today, week, month, year)
 */

export type StatsPeriod =
	| 'today'
	| 'yesterday'
	| 'week'
	| 'month'
	| 'year'

export type PeriodStats = {
	period: StatsPeriod
	period_label: string
	views: number
	unique_visitors: number
	top_pages: { path: string; views: number; visitors: number }[]
	countries: { country: string; visitors: number }[]
	browsers: { browser: string; visitors: number }[]
	devices: { device_type: string; visitors: number }[]
}

/**
 * Get timestamp boundaries for a period
 * Returns { start, end } in milliseconds (to match created_at in analytics_events)
 */
export const get_period_boundaries = (
	period: StatsPeriod,
	now: Date = new Date(),
): { start: number; end: number } => {
	const end = now.getTime()

	// Start of today (midnight local time)
	const start_of_today = new Date(now)
	start_of_today.setHours(0, 0, 0, 0)

	switch (period) {
		case 'today':
			return { start: start_of_today.getTime(), end }

		case 'yesterday': {
			const start_of_yesterday = new Date(start_of_today)
			start_of_yesterday.setDate(start_of_yesterday.getDate() - 1)
			return {
				start: start_of_yesterday.getTime(),
				end: start_of_today.getTime(),
			}
		}

		case 'week': {
			const start_of_week = new Date(start_of_today)
			start_of_week.setDate(start_of_week.getDate() - 7)
			return { start: start_of_week.getTime(), end }
		}

		case 'month': {
			const start_of_month = new Date(start_of_today)
			start_of_month.setDate(start_of_month.getDate() - 30)
			return { start: start_of_month.getTime(), end }
		}

		case 'year': {
			const start_of_year = new Date(start_of_today)
			start_of_year.setFullYear(start_of_year.getFullYear() - 1)
			return { start: start_of_year.getTime(), end }
		}

		default:
			return { start: start_of_today.getTime(), end }
	}
}

/**
 * Get human-readable label for a period
 */
export const get_period_label = (period: StatsPeriod): string => {
	switch (period) {
		case 'today':
			return 'Today'
		case 'yesterday':
			return 'Yesterday'
		case 'week':
			return 'Last 7 days'
		case 'month':
			return 'Last 30 days'
		case 'year':
			return 'Last 12 months'
		default:
			return 'Today'
	}
}

/**
 * Format raw query results into PeriodStats shape
 */
export const format_period_stats = (
	period: StatsPeriod,
	totals: { views: number; unique_visitors: number },
	top_pages: { path: string; views: number; visitors: number }[],
	countries: { country: string; visitors: number }[],
	browsers: { browser: string; visitors: number }[],
	devices: { device_type: string; visitors: number }[],
): PeriodStats => ({
	period,
	period_label: get_period_label(period),
	views: totals.views,
	unique_visitors: totals.unique_visitors,
	top_pages,
	countries,
	browsers,
	devices,
})
