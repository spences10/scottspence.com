import { invalidate_blocked_domains_cache } from '$lib/analytics/blocked-domains'
import { sqlite_client } from '$lib/sqlite/client'
import * as v from 'valibot'

/**
 * Schema for sync_blocked_domains data
 */
const sync_blocked_domains_schema = v.object({
	add: v.optional(v.array(v.string())),
	remove: v.optional(v.array(v.string())),
})

export type SyncBlockedDomainsData = v.InferOutput<
	typeof sync_blocked_domains_schema
>

/**
 * Validate incoming data for sync_blocked_domains
 */
export const validate_sync_blocked_domains = (
	data: unknown,
): SyncBlockedDomainsData => {
	return v.parse(sync_blocked_domains_schema, data)
}

/**
 * Sync blocked referrer domains
 * - add: array of domains to block
 * - remove: array of domains to unblock
 */
export const sync_blocked_domains = async (
	data: SyncBlockedDomainsData,
): Promise<{ added: number; removed: number; current: string[] }> => {
	let added = 0
	let removed = 0

	// Add domains (use prepare().run() for write operations)
	if (data.add && data.add.length > 0) {
		const insert_stmt = sqlite_client.prepare(
			`INSERT OR IGNORE INTO blocked_referrer_domains (domain, reason) VALUES (?, 'spam')`,
		)
		for (const domain of data.add) {
			const normalised = domain.toLowerCase().trim()
			if (!normalised) continue

			try {
				const result = insert_stmt.run(normalised)
				// Only count if row was actually inserted
				if (result.changes > 0) added++
			} catch (error) {
				console.error(`Failed to add domain ${normalised}:`, error)
			}
		}
	}

	// Remove domains (use prepare().run() for write operations)
	if (data.remove && data.remove.length > 0) {
		const delete_stmt = sqlite_client.prepare(
			`DELETE FROM blocked_referrer_domains WHERE domain = ?`,
		)
		for (const domain of data.remove) {
			const normalised = domain.toLowerCase().trim()
			if (!normalised) continue

			try {
				const result = delete_stmt.run(normalised)
				// Only count if row was actually deleted
				if (result.changes > 0) removed++
			} catch (error) {
				console.error(`Failed to remove domain ${normalised}:`, error)
			}
		}
	}

	// Invalidate cache so changes take effect immediately
	invalidate_blocked_domains_cache()

	// Return current list
	const result = sqlite_client.execute(
		'SELECT domain FROM blocked_referrer_domains ORDER BY domain',
	)
	const current = result.rows
		.map((r) => r.domain)
		.filter((d): d is string => typeof d === 'string')

	return { added, removed, current }
}
