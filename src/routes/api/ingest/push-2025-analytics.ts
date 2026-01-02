import { sqlite_client } from '$lib/sqlite/client'

/**
 * Receives 2025 analytics data from local script and inserts into DB
 * Called via POST with JSON payload containing analytics data
 */

interface CountryRow {
	timestamp: string
	country: string
	pageviews: number
	visits: number
}

interface DeviceTypeRow {
	timestamp: string
	device_type: string
	pageviews: number
	visits: number
}

interface PageRow {
	timestamp: string
	hostname: string
	pathname: string
	views: number
	uniques: number
}

interface ReferrerRow {
	timestamp: string
	referrer_hostname: string
	referrer_pathname: string
	views: number
	visits: number
}

export interface Push2025AnalyticsPayload {
	clear?: boolean // Only delete existing 2025 data if true
	countries?: CountryRow[]
	device_types?: DeviceTypeRow[]
	pages?: PageRow[]
	referrers?: ReferrerRow[]
}

interface ImportResult {
	table: string
	deleted: number
	inserted: number
}

export const push_2025_analytics = async (
	payload: Push2025AnalyticsPayload,
) => {
	const client = sqlite_client
	const results: ImportResult[] = []

	console.log('[push-2025] Starting import from payload')

	// Countries
	if (payload.countries && payload.countries.length > 0) {
		let deleted_count = 0
		if (payload.clear) {
			const delete_stmt = client.prepare(
				`DELETE FROM analytics_countries WHERE timestamp >= '2025-01-01'`,
			)
			deleted_count = delete_stmt.run().changes
		}

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_countries (timestamp, country, pageviews, visits)
			VALUES (?, ?, ?, ?)
		`)

		for (const row of payload.countries) {
			insert_stmt.run(
				row.timestamp,
				row.country,
				row.pageviews,
				row.visits,
			)
		}

		results.push({
			table: 'analytics_countries',
			deleted: deleted_count,
			inserted: payload.countries.length,
		})
		console.log(
			`[push-2025] analytics_countries: deleted ${deleted_count}, inserted ${payload.countries.length}`,
		)
	}

	// Device Types
	if (payload.device_types && payload.device_types.length > 0) {
		let deleted_count = 0
		if (payload.clear) {
			const delete_stmt = client.prepare(
				`DELETE FROM analytics_device_types WHERE timestamp >= '2025-01-01'`,
			)
			deleted_count = delete_stmt.run().changes
		}

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_device_types (timestamp, device_type, pageviews, visits)
			VALUES (?, ?, ?, ?)
		`)

		for (const row of payload.device_types) {
			insert_stmt.run(
				row.timestamp,
				row.device_type,
				row.pageviews,
				row.visits,
			)
		}

		results.push({
			table: 'analytics_device_types',
			deleted: deleted_count,
			inserted: payload.device_types.length,
		})
		console.log(
			`[push-2025] analytics_device_types: deleted ${deleted_count}, inserted ${payload.device_types.length}`,
		)
	}

	// Pages
	if (payload.pages && payload.pages.length > 0) {
		let deleted_count = 0
		if (payload.clear) {
			const delete_stmt = client.prepare(
				`DELETE FROM analytics_pages WHERE timestamp >= '2025-01-01'`,
			)
			deleted_count = delete_stmt.run().changes
		}

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_pages (timestamp, hostname, pathname, views, uniques)
			VALUES (?, ?, ?, ?, ?)
		`)

		for (const row of payload.pages) {
			insert_stmt.run(
				row.timestamp,
				row.hostname,
				row.pathname,
				row.views,
				row.uniques,
			)
		}

		results.push({
			table: 'analytics_pages',
			deleted: deleted_count,
			inserted: payload.pages.length,
		})
		console.log(
			`[push-2025] analytics_pages: deleted ${deleted_count}, inserted ${payload.pages.length}`,
		)
	}

	// Referrers
	if (payload.referrers && payload.referrers.length > 0) {
		let deleted_count = 0
		if (payload.clear) {
			const delete_stmt = client.prepare(
				`DELETE FROM analytics_referrers WHERE timestamp >= '2025-01-01'`,
			)
			deleted_count = delete_stmt.run().changes
		}

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_referrers (timestamp, referrer_hostname, referrer_pathname, views, visits)
			VALUES (?, ?, ?, ?, ?)
		`)

		for (const row of payload.referrers) {
			insert_stmt.run(
				row.timestamp,
				row.referrer_hostname,
				row.referrer_pathname,
				row.views,
				row.visits,
			)
		}

		results.push({
			table: 'analytics_referrers',
			deleted: deleted_count,
			inserted: payload.referrers.length,
		})
		console.log(
			`[push-2025] analytics_referrers: deleted ${deleted_count}, inserted ${payload.referrers.length}`,
		)
	}

	const total_inserted = results.reduce(
		(sum, r) => sum + r.inserted,
		0,
	)
	console.log(
		`[push-2025] Complete. Total rows inserted: ${total_inserted}`,
	)

	return {
		success: true,
		message: '2025 analytics data imported',
		results,
		total_inserted,
	}
}
