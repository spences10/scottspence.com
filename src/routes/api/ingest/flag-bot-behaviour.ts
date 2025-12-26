import { sqlite_client } from '$lib/sqlite/client'

interface FlagBotResult {
	success: boolean
	flagged_visitors: number
	flagged_events: number
	error?: string
}

/**
 * Flag visitors with bot-like behaviour patterns as is_bot=1
 * Threshold: hits > 200 AND unique_pages <= 3
 * Should be run daily via cron
 */
export async function flag_bot_behaviour(): Promise<FlagBotResult> {
	const client = sqlite_client

	try {
		// Find visitor_hashes with bot-like patterns
		// hits > 200 AND unique_pages <= 3 = scraper behaviour
		const result = client
			.prepare(
				`
			UPDATE analytics_events
			SET is_bot = 1
			WHERE is_bot = 0
			AND visitor_hash IN (
				SELECT visitor_hash
				FROM analytics_events
				GROUP BY visitor_hash
				HAVING COUNT(*) > 200 AND COUNT(DISTINCT path) <= 3
			)
		`,
			)
			.run()

		// Count how many unique visitors were flagged
		const flagged_visitors = client
			.prepare(
				`
			SELECT COUNT(DISTINCT visitor_hash) as count
			FROM analytics_events
			WHERE is_bot = 1
			AND visitor_hash IN (
				SELECT visitor_hash
				FROM analytics_events
				GROUP BY visitor_hash
				HAVING COUNT(*) > 200 AND COUNT(DISTINCT path) <= 3
			)
		`,
			)
			.get() as { count: number }

		console.log('Bot behaviour flagging complete:', {
			flagged_events: result.changes,
			flagged_visitors: flagged_visitors?.count || 0,
		})

		return {
			success: true,
			flagged_visitors: flagged_visitors?.count || 0,
			flagged_events: result.changes,
		}
	} catch (error) {
		console.error('Bot behaviour flagging error:', error)
		return {
			success: false,
			flagged_visitors: 0,
			flagged_events: 0,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
