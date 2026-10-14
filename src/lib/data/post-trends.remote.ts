import {
	BYPASS_DB_READS,
	CACHE_DURATIONS,
	get_from_cache,
	set_cache,
} from '#lib/cache/server-cache.js';
import { sqlite_client } from '#lib/sqlite/client.js';
import { query } from '$app/server';
import {
	add_days,
	fetch_post_movers,
	get_launch_cohort,
	LAUNCH_DAYS,
	MOVERS_WINDOW_DAYS,
	pick_movers,
} from './post-analytics.helpers';

/**
 * Views in each recent post's first 30 days, newest first
 */
export const get_launch_board = query((): LaunchBoard | null => {
	if (BYPASS_DB_READS.post_analytics) return null;

	try {
		const cohort = get_launch_cohort(sqlite_client);
		if (!cohort || cohort.launches.length === 0) return null;

		const launches = cohort.launches
			.map(({ slug, title, pub, curve }) => {
				const day = Math.min(curve.days_live, LAUNCH_DAYS) - 1;
				return {
					slug,
					title,
					pub,
					views: curve.cumulative[day] ?? 0,
					days_live: curve.days_live,
				};
			})
			.sort((a, b) => b.pub.localeCompare(a.pub));

		return {
			launches,
			days: LAUNCH_DAYS,
			median: cohort.median[LAUNCH_DAYS - 1],
		};
	} catch (error) {
		console.warn('Database unavailable for launch board:', error);
		return null;
	}
});

/**
 * Posts with the biggest change in views between the last two windows
 */
export const get_post_movers = query((): PostMovers | null => {
	if (BYPASS_DB_READS.post_analytics) return null;

	const cache_key = 'post_analytics:movers';
	const cached = get_from_cache<PostMovers>(
		cache_key,
		CACHE_DURATIONS.post_analytics.launch_cohort,
	);
	if (cached) return cached;

	try {
		const cohort = get_launch_cohort(sqlite_client);
		if (!cohort) return null;

		const rows = fetch_post_movers(sqlite_client, cohort.last_date);
		const result: PostMovers = {
			...pick_movers(rows),
			window_days: MOVERS_WINDOW_DAYS,
			recent_from: add_days(
				cohort.last_date,
				-MOVERS_WINDOW_DAYS + 1,
			),
			last_date: cohort.last_date,
		};
		set_cache(cache_key, result);
		return result;
	} catch (error) {
		console.warn('Database unavailable for post movers:', error);
		return null;
	}
});
