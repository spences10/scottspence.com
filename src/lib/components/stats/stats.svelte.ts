import type { StatsPeriod } from '$lib/analytics/period-stats.remote'

// Live stats types
export type LiveStats = {
	active_visitors: number
	recent_visitors: number
	active_pages: { path: string; viewers: number }[]
	countries: { country: string; visitors: number }[]
	countries_total: number
	browsers: { browser: string; visitors: number }[]
	devices: { device_type: string; visitors: number }[]
	top_paths: { path: string; views: number; visitors: number }[]
	paths_total: number
}

// Historical stats types
export interface Stats {
	views: number
	unique_visitors: number
}

export interface MonthlyStats extends Stats {
	year_month: string
}

export interface YearlyStats extends Stats {
	year: string
}

export interface SiteStat {
	title: string
	slug: string
	monthly_stats: MonthlyStats[]
	yearly_stats: YearlyStats[]
	all_time_stats: Stats
}

// Period button labels
export const period_labels: Record<StatsPeriod, string> = {
	today: 'Today',
	yesterday: 'Yesterday',
	week: '7 days',
	month: '30 days',
	year: '12 months',
}

// Helper functions
export const format_path = (path: string) => {
	if (path === '/') return 'Home'
	if (path.startsWith('/posts/')) {
		return path.replace('/posts/', '').replaceAll('-', ' ')
	}
	return path.slice(1).replaceAll('-', ' ').replaceAll('/', ' / ')
}

export const country_flag = (code: string) => {
	if (!code || code.length !== 2) return '🌍'
	const offset = 127397
	return String.fromCodePoint(
		...code
			.toUpperCase()
			.split('')
			.map((c) => c.charCodeAt(0) + offset),
	)
}

export const device_icon = (type: string) => {
	const icons: Record<string, string> = {
		desktop: '🖥️',
		mobile: '📱',
		tablet: '📱',
	}
	return icons[type?.toLowerCase()] ?? '💻'
}

export const parse_referrer = (url: string) => {
	try {
		const hostname = new URL(url).hostname.replace('www.', '')
		if (hostname.includes('google')) return 'Google'
		if (hostname.includes('bing')) return 'Bing'
		if (hostname.includes('duckduckgo')) return 'DuckDuckGo'
		if (hostname.includes('github')) return 'GitHub'
		if (hostname.includes('reddit')) return 'Reddit'
		if (hostname.includes('twitter') || hostname.includes('x.com'))
			return 'X/Twitter'
		if (hostname.includes('linkedin')) return 'LinkedIn'
		if (hostname.includes('facebook')) return 'Facebook'
		return hostname
	} catch {
		return url || 'Direct'
	}
}
