// In-memory sliding window rate limiter. The site runs as a single
// Node process, so counts live here and reset on restart.
const WINDOW_MS = 10 * 1000;
const MAX_REQUESTS = 10;
const SWEEP_THRESHOLD = 1000;

const requests = new Map<string, number[]>();

// Drop keys with no requests left in the window so the map stays small
const sweep = (window_start: number) => {
	for (const [key, timestamps] of requests) {
		if (timestamps[timestamps.length - 1] <= window_start) {
			requests.delete(key);
		}
	}
};

export const ratelimit = {
	limit: (key: string): { success: boolean; reset: number } => {
		const now = Date.now();
		const window_start = now - WINDOW_MS;

		if (requests.size > SWEEP_THRESHOLD) {
			sweep(window_start);
		}

		const timestamps = (requests.get(key) ?? []).filter(
			(timestamp) => timestamp > window_start,
		);
		const success = timestamps.length < MAX_REQUESTS;
		if (success) {
			timestamps.push(now);
		}
		requests.set(key, timestamps);

		return { success, reset: timestamps[0] + WINDOW_MS };
	},
	clear: () => requests.clear(),
};

const daily_counts = new Map<
	string,
	{ day: string; count: number }
>();

// Global cap per UTC day, shared by every visitor
export const daily_cap = {
	take: (
		key: string,
		max: number,
	): { success: boolean; remaining: number } => {
		const day = new Date().toISOString().slice(0, 10);
		const current = daily_counts.get(key);
		const count = current?.day === day ? current.count : 0;

		if (count >= max) {
			return { success: false, remaining: 0 };
		}

		daily_counts.set(key, { day, count: count + 1 });
		return { success: true, remaining: max - count - 1 };
	},
	clear: () => daily_counts.clear(),
};
