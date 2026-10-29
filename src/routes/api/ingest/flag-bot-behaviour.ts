import { BOT_THRESHOLDS } from '#lib/analytics/bot-thresholds.js';
import { sqlite_client } from '#lib/sqlite/client.js';

export interface UserAgentStats {
	user_agent: string;
	/** Distinct non-bot visitors with a referrer */
	referred_visitors: number;
}

/**
 * Chrome major version for desktop UAs (Windows, macOS, Linux)
 * Mobile and ChromeOS are skipped - old phones get stuck on old Chrome
 */
export const parse_desktop_chrome_major = (
	user_agent: string,
): number | null => {
	if (!/Windows NT|Macintosh|X11/.test(user_agent)) return null;
	if (/Android|Mobile|CrOS/.test(user_agent)) return null;
	const match = user_agent.match(/Chrome\/(\d+)\./);
	return match ? Number(match[1]) : null;
};

/**
 * The day's current Chrome major: the newest one with enough referred visitors
 * Newest, not most used - a bot fleet on one old UA can outnumber any
 * single real major (Oct 2026: Chrome 146 bot beat real Chrome 156)
 * Returns null when no major has enough visitors to trust
 */
export const find_current_chrome_major = (
	stats: UserAgentStats[],
	min_visitors: number,
): number | null => {
	const visitors_by_major = new Map<number, number>();
	for (const { user_agent, referred_visitors } of stats) {
		const major = parse_desktop_chrome_major(user_agent);
		if (major === null) continue;
		visitors_by_major.set(
			major,
			(visitors_by_major.get(major) ?? 0) + referred_visitors,
		);
	}

	let current: number | null = null;
	for (const [major, visitors] of visitors_by_major) {
		if (
			visitors >= min_visitors &&
			(current === null || major > current)
		) {
			current = major;
		}
	}
	return current;
};

/**
 * Desktop Chrome UAs more than `majors_behind` versions behind current
 */
export const find_stale_chrome_agents = (
	stats: UserAgentStats[],
	current_major: number,
	majors_behind: number,
): string[] =>
	stats
		.filter(({ user_agent }) => {
			const major = parse_desktop_chrome_major(user_agent);
			return major !== null && major < current_major - majors_behind;
		})
		.map(({ user_agent }) => user_agent);

/**
 * Flag suspicious visitors as bots based on behaviour patterns
 * Run via cron at 00:10 daily (after events accumulate, before rollup)
 *
 * Flags events as is_bot=1 when visitor exceeds thresholds
 * Preserves raw data - just updates the bot flag
 */
export const flag_bot_behaviour = async () => {
	const client = sqlite_client;

	// Calculate yesterday's date range
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	const date_str = yesterday.toISOString().slice(0, 10);
	const start_ts = new Date(date_str + 'T00:00:00Z').getTime();
	const end_ts = start_ts + 86400000;

	console.log(`[bot-flag] Processing ${date_str}`);

	// Flag 1: Excessive hits per path per day
	const flag_per_path = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND visitor_hash IN (
			SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash, path
			HAVING COUNT(*) > ?
		)
	`);
	const per_path_result = flag_per_path.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY,
	);
	console.log(
		`[bot-flag] Flagged ${per_path_result.changes} events (per-path threshold: ${BOT_THRESHOLDS.MAX_HITS_PER_PATH_PER_DAY})`,
	);

	// Flag 2: Excessive total hits per day
	const flag_total = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND visitor_hash IN (
			SELECT visitor_hash
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY visitor_hash
			HAVING COUNT(*) > ?
		)
	`);
	const total_result = flag_total.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY,
	);
	console.log(
		`[bot-flag] Flagged ${total_result.changes} events (total threshold: ${BOT_THRESHOLDS.MAX_HITS_TOTAL_PER_DAY})`,
	);

	// Flag 3: Homepage monitors - high homepage % + high direct % + many IPs
	const flag_homepage_monitors = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND user_agent IN (
			SELECT user_agent
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY user_agent
			HAVING
				COUNT(DISTINCT visitor_hash) > ?
				AND 100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*) > ?
				AND 100.0 * SUM(CASE WHEN referrer IS NULL THEN 1 ELSE 0 END) / COUNT(*) > ?
		)
	`);
	const homepage_result = flag_homepage_monitors.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MIN_VISITORS_FOR_AGGREGATE,
		BOT_THRESHOLDS.HOMEPAGE_PCT_THRESHOLD,
		BOT_THRESHOLDS.DIRECT_PCT_THRESHOLD,
	);
	console.log(
		`[bot-flag] Flagged ${homepage_result.changes} events (homepage monitors)`,
	);

	// Flag 4: Direct-only scrapers - 100% direct traffic + many IPs + >50% homepage
	// (homepage requirement excludes legitimate app users who visit posts)
	const flag_direct_only = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND user_agent IN (
			SELECT user_agent
			FROM analytics_events
			WHERE created_at >= ? AND created_at < ?
			GROUP BY user_agent
			HAVING
				COUNT(DISTINCT visitor_hash) > ?
				AND SUM(CASE WHEN referrer IS NULL THEN 1 ELSE 0 END) = COUNT(*)
				AND 100.0 * SUM(CASE WHEN path = '/' THEN 1 ELSE 0 END) / COUNT(*) > 50
		)
	`);
	const direct_result = flag_direct_only.run(
		start_ts,
		end_ts,
		start_ts,
		end_ts,
		BOT_THRESHOLDS.MIN_VISITORS_FOR_DIRECT_ONLY,
	);
	console.log(
		`[bot-flag] Flagged ${direct_result.changes} events (direct-only scrapers)`,
	);

	// Flag 5: Malformed UA (quotes around user agent string)
	const flag_malformed_ua = client.prepare(`
		UPDATE analytics_events
		SET is_bot = 1
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 0
		AND (user_agent LIKE '"%' OR user_agent LIKE '%"')
	`);
	const malformed_result = flag_malformed_ua.run(start_ts, end_ts);
	console.log(
		`[bot-flag] Flagged ${malformed_result.changes} events (malformed UA)`,
	);

	// Flag 6: Stale desktop Chrome - far behind the version humans use
	// Runs last so "current" is measured from traffic not already flagged
	const ua_stats = client
		.prepare(
			`
		SELECT
			user_agent,
			COUNT(DISTINCT CASE WHEN referrer IS NOT NULL AND is_bot = 0 THEN visitor_hash END) AS referred_visitors
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ?
		AND user_agent IS NOT NULL
		GROUP BY user_agent
	`,
		)
		.all(start_ts, end_ts) as unknown as UserAgentStats[];
	const current_chrome_major = find_current_chrome_major(
		ua_stats,
		BOT_THRESHOLDS.MIN_VISITORS_FOR_CURRENT_CHROME,
	);
	let stale_chrome_changes = 0;
	if (current_chrome_major !== null) {
		const stale_agents = find_stale_chrome_agents(
			ua_stats,
			current_chrome_major,
			BOT_THRESHOLDS.STALE_CHROME_MAJOR_VERSIONS,
		);
		if (stale_agents.length > 0) {
			const flag_stale_chrome = client.prepare(`
				UPDATE analytics_events
				SET is_bot = 1
				WHERE created_at >= ? AND created_at < ?
				AND is_bot = 0
				AND user_agent IN (SELECT value FROM json_each(?))
			`);
			stale_chrome_changes = Number(
				flag_stale_chrome.run(
					start_ts,
					end_ts,
					JSON.stringify(stale_agents),
				).changes,
			);
		}
		console.log(
			`[bot-flag] Flagged ${stale_chrome_changes} events (stale Chrome: below ${current_chrome_major - BOT_THRESHOLDS.STALE_CHROME_MAJOR_VERSIONS}, current ${current_chrome_major})`,
		);
	} else {
		console.log(
			'[bot-flag] Skipped stale Chrome check (not enough referred visitors to set current version)',
		);
	}

	// Count how many unique visitors were flagged
	const flagged_visitors = client
		.prepare(
			`
		SELECT COUNT(DISTINCT visitor_hash) as count
		FROM analytics_events
		WHERE created_at >= ? AND created_at < ?
		AND is_bot = 1
	`,
		)
		.get(start_ts, end_ts) as { count: number };

	const total_flagged =
		per_path_result.changes +
		total_result.changes +
		homepage_result.changes +
		direct_result.changes +
		malformed_result.changes +
		stale_chrome_changes;

	return {
		success: true,
		message: `Flagged bot behaviour for ${date_str}`,
		events_flagged: total_flagged,
		visitors_flagged: flagged_visitors.count,
		current_chrome_major,
		thresholds: BOT_THRESHOLDS,
	};
};
