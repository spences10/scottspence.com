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
