/**
 * Period stats helpers - testable pure functions
 * For querying analytics_events by time period (today, week, month, year)
 */

export type StatsPeriod =
	| 'today'
	| 'yesterday'
	| 'week'
	| 'month'
	| 'year';

export type FilterMode = 'humans' | 'bots' | 'all';

export type PeriodStats = {
	period: StatsPeriod;
	period_label: string;
	filter_mode: FilterMode;
	views: number;
	unique_visitors: number;
	bot_views: number;
	bot_visitors: number;
	top_pages: { path: string; views: number; visitors: number }[];
	countries: { country: string; views: number; visitors: number }[];
	browsers: { browser: string; views: number; visitors: number }[];
	devices: { device_type: string; views: number; visitors: number }[];
	referrers: { referrer: string; views: number; visitors: number }[];
	previous: PeriodComparison | null;
};

export type PeriodCounts = { views: number; visitors: number };

/**
 * Stats for the period before the selected one, keyed for delta lookups
 * A null total or breakdown means there is nothing comparable to diff
 */
export type PeriodComparison = {
	label: string;
	views: number | null;
	unique_visitors: number | null;
	pages: Record<string, PeriodCounts>;
	countries: Record<string, PeriodCounts> | null;
	browsers: Record<string, PeriodCounts> | null;
	devices: Record<string, PeriodCounts> | null;
	referrers: Record<string, PeriodCounts> | null;
};

/**
 * Turn keyed count rows into a lookup
 */
export const to_counts_lookup = (
	rows: { key: string; views: number; visitors: number }[],
): Record<string, PeriodCounts> =>
	Object.fromEntries(
		rows.map(({ key, views, visitors }) => [
			key,
			{ views, visitors },
		]),
	);

/**
 * Change against the previous period, or null when it can't be compared
 */
export const get_delta = (
	current: number,
	previous: number | null | undefined,
): number | null => (previous == null ? null : current - previous);

/**
 * Dates covering the window before one of `days` full days plus today
 * so far: the `days` dates before `start_date`, plus `day_fraction` of
 * the date before those. `to_date` is exclusive.
 */
export const get_previous_window = (
	start_date: string,
	days: number,
	day_fraction: number,
): {
	partial_date: string;
	partial_weight: number;
	from_date: string;
	to_date: string;
} => {
	const shift = (offset: number) => {
		const date = new Date(start_date + 'T00:00:00Z');
		date.setUTCDate(date.getUTCDate() - offset);
		return date.toISOString().split('T')[0];
	};
	const partial_date = shift(days + 1);
	return {
		partial_date,
		partial_weight: Math.min(Math.max(day_fraction, 0), 1),
		from_date: partial_date,
		to_date: start_date,
	};
};

/**
 * Get timestamp boundaries for a period
 * Returns { start, end } in milliseconds (to match created_at in analytics_events)
 */
export const get_period_boundaries = (
	period: StatsPeriod,
	now: Date = new Date(),
): { start: number; end: number } => {
	const end = now.getTime();

	// Start of today (midnight local time)
	const start_of_today = new Date(now);
	start_of_today.setHours(0, 0, 0, 0);

	switch (period) {
		case 'today':
			return { start: start_of_today.getTime(), end };

		case 'yesterday': {
			const start_of_yesterday = new Date(start_of_today);
			start_of_yesterday.setDate(start_of_yesterday.getDate() - 1);
			return {
				start: start_of_yesterday.getTime(),
				end: start_of_today.getTime(),
			};
		}

		case 'week': {
			const start_of_week = new Date(start_of_today);
			start_of_week.setDate(start_of_week.getDate() - 7);
			return { start: start_of_week.getTime(), end };
		}

		case 'month': {
			const start_of_month = new Date(start_of_today);
			start_of_month.setDate(start_of_month.getDate() - 30);
			return { start: start_of_month.getTime(), end };
		}

		case 'year': {
			const start_of_year = new Date(start_of_today);
			start_of_year.setFullYear(start_of_year.getFullYear() - 1);
			return { start: start_of_year.getTime(), end };
		}

		default:
			return { start: start_of_today.getTime(), end };
	}
};

/**
 * Get human-readable label for a period
 */
export const get_period_label = (period: StatsPeriod): string => {
	switch (period) {
		case 'today':
			return 'Today';
		case 'yesterday':
			return 'Yesterday';
		case 'week':
			return 'Last 7 days';
		case 'month':
			return 'Last 30 days';
		case 'year':
			return 'Last 12 months';
		default:
			return 'Today';
	}
};

/**
 * Format raw query results into PeriodStats shape
 */
export const format_period_stats = (
	period: StatsPeriod,
	filter_mode: FilterMode,
	totals: { views: number; unique_visitors: number },
	bot_totals: { views: number; visitors: number },
	top_pages: { path: string; views: number; visitors: number }[],
	countries: { country: string; views: number; visitors: number }[],
	browsers: { browser: string; views: number; visitors: number }[],
	devices: { device_type: string; views: number; visitors: number }[],
	referrers: { referrer: string; views: number; visitors: number }[],
	previous: PeriodComparison | null = null,
): PeriodStats => ({
	period,
	period_label: get_period_label(period),
	filter_mode,
	views: totals.views,
	unique_visitors: totals.unique_visitors,
	bot_views: bot_totals.views,
	bot_visitors: bot_totals.visitors,
	top_pages,
	countries,
	browsers,
	devices,
	referrers,
	previous,
});
