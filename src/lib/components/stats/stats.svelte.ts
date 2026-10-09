import type { StatsPeriod } from '#lib/analytics/period-stats.remote.js';
import { settled } from 'svelte';

// Live stats types
export type LiveStats = {
	active_visitors: number;
	recent_visitors: number;
	active_pages: { path: string; viewers: number }[];
	countries: { country: string; visitors: number }[];
	countries_total: number;
	browsers: { browser: string; visitors: number }[];
	devices: { device_type: string; visitors: number }[];
	referrers: { referrer: string; visitors: number }[];
	top_paths: { path: string; views: number; visitors: number }[];
	paths_total: number;
};

// Historical stats types
export interface Stats {
	views: number;
	unique_visitors: number;
}

export interface MonthlyStats extends Stats {
	year_month: string;
}

export interface YearlyStats extends Stats {
	year: string;
}

export interface SiteStat {
	title: string;
	slug: string;
	monthly_stats: MonthlyStats[];
	yearly_stats: YearlyStats[];
	all_time_stats: Stats;
}

/**
 * A copy of a value taken once pending async work has settled
 * An isometric chart updated during a pending async batch recomputes
 * its derived state on every read and locks the page up, so the 3D
 * charts draw from this rather than from the period queries directly
 */
export const settled_copy = <T>(
	get: () => T,
	initial: T,
	on_update?: () => void,
) => {
	let current = $state.raw(initial);

	$effect(() => {
		const next = get();
		let cancelled = false;
		// Written from a task of its own, clear of the batch that
		// `settled` resolves in
		settled().then(() =>
			setTimeout(() => {
				if (cancelled) return;
				current = next;
				on_update?.();
			}),
		);
		return () => {
			cancelled = true;
		};
	});

	return {
		get current() {
			return current;
		},
	};
};

/**
 * Points along a smooth curve through `points`, for a 3D chart to join
 * with straight lines
 * A chart fits its curve through the points as they appear on screen,
 * so once the view is turned the curve leans and curls over itself.
 * Smoothing in data space first keeps each ridge standing upright
 * from every angle. Monotone, so it never overshoots a value.
 */
export const smooth_curve = (
	points: { x: number; y: number }[],
	steps = 8,
): { x: number; y: number }[] => {
	const count = points.length;
	if (count < 3) return points;

	const slopes = points
		.slice(0, -1)
		.map(
			(point, index) =>
				(points[index + 1].y - point.y) /
				(points[index + 1].x - point.x),
		);
	const tangents = points.map((_, index) =>
		index === 0
			? slopes[0]
			: index === count - 1
				? slopes[count - 2]
				: slopes[index - 1] * slopes[index] <= 0
					? 0
					: (slopes[index - 1] + slopes[index]) / 2,
	);
	// Rein the tangents in wherever they would carry the curve past
	// the next point (Fritsch-Carlson)
	slopes.forEach((slope, index) => {
		if (slope === 0) {
			tangents[index] = 0;
			tangents[index + 1] = 0;
			return;
		}
		const a = tangents[index] / slope;
		const b = tangents[index + 1] / slope;
		const length = Math.hypot(a, b);
		if (length > 3) {
			tangents[index] = (3 / length) * a * slope;
			tangents[index + 1] = (3 / length) * b * slope;
		}
	});

	const curve = [points[0]];
	for (let index = 0; index < count - 1; index++) {
		const from = points[index];
		const to = points[index + 1];
		const width = to.x - from.x;
		for (let step = 1; step <= steps; step++) {
			const t = step / steps;
			const t2 = t * t;
			const t3 = t2 * t;
			curve.push({
				x: from.x + width * t,
				y:
					(2 * t3 - 3 * t2 + 1) * from.y +
					(t3 - 2 * t2 + t) * width * tangents[index] +
					(-2 * t3 + 3 * t2) * to.y +
					(t3 - t2) * width * tangents[index + 1],
			});
		}
	}
	return curve;
};

// One month of traffic summed across every post
export interface MonthCell {
	year: string;
	month: number;
	views: number;
	visitors: number;
}

export type HistoricalMetric = 'views' | 'visitors';

export const month_labels = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

// Period button labels
export const period_labels: Record<StatsPeriod, string> = {
	today: 'Today',
	yesterday: 'Yesterday',
	week: '7 days',
	month: '30 days',
	year: '12 months',
};

// Helper functions
export const format_path = (path: string) => {
	if (path === '/') return 'Home';
	if (path.startsWith('/posts/')) {
		return path.replace('/posts/', '').replaceAll('-', ' ');
	}
	return path.slice(1).replaceAll('-', ' ').replaceAll('/', ' / ');
};

export const country_flag = (code: string) => {
	if (!code || code.length !== 2) return '🌍';
	const offset = 127397;
	return String.fromCodePoint(
		...code
			.toUpperCase()
			.split('')
			.map((c) => c.charCodeAt(0) + offset),
	);
};

export const device_icon = (type: string) => {
	const icons: Record<string, string> = {
		desktop: '🖥️',
		mobile: '📱',
		tablet: '📱',
	};
	return icons[type?.toLowerCase()] ?? '💻';
};

export const parse_referrer = (url: string) => {
	try {
		const hostname = new URL(url).hostname.replace('www.', '');
		if (hostname.includes('google')) return 'Google';
		if (hostname.includes('bing')) return 'Bing';
		if (hostname.includes('duckduckgo')) return 'DuckDuckGo';
		if (hostname.includes('github')) return 'GitHub';
		if (hostname.includes('reddit')) return 'Reddit';
		if (hostname.includes('twitter') || hostname.includes('x.com'))
			return 'X/Twitter';
		if (hostname.includes('linkedin')) return 'LinkedIn';
		if (hostname.includes('facebook')) return 'Facebook';
		return hostname;
	} catch {
		return url || 'Direct';
	}
};
