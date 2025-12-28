import { query } from '$app/server'
import * as v from 'valibot'
import { get_live_stats, get_path_viewers } from './queue'

/**
 * Get live analytics from in-memory queue
 * No DB read - returns data from last ~5s flush window
 */
export const get_live_analytics = query(() => {
	return get_live_stats()
})

/**
 * Get viewers for a specific path
 * No DB read - returns count from in-memory queue
 */
export const get_viewing_now = query(
	v.object({ path: v.string() }),
	({ path }) => {
		return {
			path,
			viewers: get_path_viewers(path),
		}
	},
)
