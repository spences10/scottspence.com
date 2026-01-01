import { sqlite_client } from '$lib/sqlite/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * One-time import of Fathom 2025 data from CSV exports
 *
 * CSVs expected in data/ directory:
 * - Countries.csv → analytics_countries
 * - DeviceTypes.csv → analytics_device_types
 * - Pages.csv → analytics_pages
 * - Referrers.csv → analytics_referrers
 *
 * Run locally first to validate, then on prod:
 * curl -X POST http://localhost:5173/api/ingest \
 *   -H "Content-Type: application/json" \
 *   -d '{"task": "import_fathom_2025", "token": "..."}'
 */

interface ImportResult {
	table: string
	deleted: number
	inserted: number
}

const parse_csv = <T>(
	content: string,
	expected_fields?: number,
): T[] => {
	const lines = content.trim().split('\n')
	const headers = lines[0].split(',')
	const field_count = expected_fields ?? headers.length

	const rows: T[] = []
	let skipped = 0

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',')
		// Skip malformed rows (wrong field count)
		if (values.length !== field_count) {
			skipped++
			continue
		}
		const row: Record<string, string> = {}
		headers.forEach((header, j) => {
			row[header.trim()] = values[j]?.trim() ?? ''
		})
		rows.push(row as T)
	}

	if (skipped > 0) {
		console.log(`[import] Skipped ${skipped} malformed rows`)
	}

	return rows
}

const filter_2025 = <T extends { Timestamp: string }>(
	rows: T[],
): T[] => {
	return rows.filter((row) => row.Timestamp.startsWith('2025'))
}

export const import_fathom_2025 = async () => {
	const client = sqlite_client
	const data_dir = join(process.cwd(), 'data')
	const results: ImportResult[] = []

	console.log('[import] Starting Fathom 2025 import from', data_dir)

	// Countries
	{
		const csv = readFileSync(join(data_dir, 'Countries.csv'), 'utf-8')
		const rows = filter_2025(
			parse_csv<{
				Timestamp: string
				Country: string
				State: string
				Pageviews: string
				Visits: string
			}>(csv),
		)

		const delete_stmt = client.prepare(
			`DELETE FROM analytics_countries WHERE timestamp >= '2025-01-01'`,
		)
		const deleted = delete_stmt.run()

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_countries (timestamp, country, pageviews, visits)
			VALUES (?, ?, ?, ?)
		`)

		for (const row of rows) {
			insert_stmt.run(
				row.Timestamp,
				row.Country,
				parseInt(row.Pageviews, 10),
				parseInt(row.Visits, 10),
			)
		}

		results.push({
			table: 'analytics_countries',
			deleted: deleted.changes,
			inserted: rows.length,
		})
		console.log(
			`[import] analytics_countries: deleted ${deleted.changes}, inserted ${rows.length}`,
		)
	}

	// Device Types
	{
		const csv = readFileSync(
			join(data_dir, 'DeviceTypes.csv'),
			'utf-8',
		)
		const rows = filter_2025(
			parse_csv<{
				Timestamp: string
				'Device Type': string
				Pageviews: string
				Visits: string
			}>(csv),
		)

		const delete_stmt = client.prepare(
			`DELETE FROM analytics_device_types WHERE timestamp >= '2025-01-01'`,
		)
		const deleted = delete_stmt.run()

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_device_types (timestamp, device_type, pageviews, visits)
			VALUES (?, ?, ?, ?)
		`)

		for (const row of rows) {
			insert_stmt.run(
				row.Timestamp,
				row['Device Type'],
				parseInt(row.Pageviews, 10),
				parseInt(row.Visits, 10),
			)
		}

		results.push({
			table: 'analytics_device_types',
			deleted: deleted.changes,
			inserted: rows.length,
		})
		console.log(
			`[import] analytics_device_types: deleted ${deleted.changes}, inserted ${rows.length}`,
		)
	}

	// Pages
	{
		const csv = readFileSync(join(data_dir, 'Pages.csv'), 'utf-8')
		const rows = filter_2025(
			parse_csv<{
				Timestamp: string
				Hostname: string
				Pathname: string
				Views: string
				Uniques: string
			}>(csv),
		)

		const delete_stmt = client.prepare(
			`DELETE FROM analytics_pages WHERE timestamp >= '2025-01-01'`,
		)
		const deleted = delete_stmt.run()

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_pages (timestamp, hostname, pathname, views, uniques)
			VALUES (?, ?, ?, ?, ?)
		`)

		for (const row of rows) {
			insert_stmt.run(
				row.Timestamp,
				row.Hostname,
				row.Pathname,
				parseInt(row.Views, 10),
				parseInt(row.Uniques, 10),
			)
		}

		results.push({
			table: 'analytics_pages',
			deleted: deleted.changes,
			inserted: rows.length,
		})
		console.log(
			`[import] analytics_pages: deleted ${deleted.changes}, inserted ${rows.length}`,
		)
	}

	// Referrers
	{
		const csv = readFileSync(join(data_dir, 'Referrers.csv'), 'utf-8')
		const rows = filter_2025(
			parse_csv<{
				Timestamp: string
				'Referrer Hostname': string
				'Referrer Pathname': string
				Views: string
				Visits: string
			}>(csv),
		)

		const delete_stmt = client.prepare(
			`DELETE FROM analytics_referrers WHERE timestamp >= '2025-01-01'`,
		)
		const deleted = delete_stmt.run()

		const insert_stmt = client.prepare(`
			INSERT INTO analytics_referrers (timestamp, referrer_hostname, referrer_pathname, views, visits)
			VALUES (?, ?, ?, ?, ?)
		`)

		for (const row of rows) {
			insert_stmt.run(
				row.Timestamp,
				row['Referrer Hostname'],
				row['Referrer Pathname'],
				parseInt(row.Views, 10),
				parseInt(row.Visits, 10),
			)
		}

		results.push({
			table: 'analytics_referrers',
			deleted: deleted.changes,
			inserted: rows.length,
		})
		console.log(
			`[import] analytics_referrers: deleted ${deleted.changes}, inserted ${rows.length}`,
		)
	}

	const total_inserted = results.reduce(
		(sum, r) => sum + r.inserted,
		0,
	)
	console.log(
		`[import] Complete. Total rows inserted: ${total_inserted}`,
	)

	return {
		success: true,
		message: 'Fathom 2025 data imported',
		results,
		total_inserted,
	}
}
