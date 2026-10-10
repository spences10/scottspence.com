import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { ratelimit } from './rate-limit';

const use_up_limit = (key: string) => {
	for (let i = 0; i < 10; i++) {
		ratelimit.limit(key);
	}
};

describe('ratelimit', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
		ratelimit.clear();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('allows 10 requests in 10 seconds', () => {
		for (let i = 0; i < 10; i++) {
			expect(ratelimit.limit('1.2.3.4').success).toBe(true);
		}
	});

	it('blocks the 11th request in the window', () => {
		use_up_limit('1.2.3.4');

		expect(ratelimit.limit('1.2.3.4').success).toBe(false);
	});

	it('reports when the oldest request leaves the window', () => {
		const start = Date.now();
		use_up_limit('1.2.3.4');
		vi.advanceTimersByTime(4000);

		expect(ratelimit.limit('1.2.3.4').reset).toBe(start + 10_000);
	});

	it('allows requests again once the window has passed', () => {
		use_up_limit('1.2.3.4');
		vi.advanceTimersByTime(10_000);

		expect(ratelimit.limit('1.2.3.4').success).toBe(true);
	});

	it('frees one slot at a time as requests age out', () => {
		ratelimit.limit('1.2.3.4');
		vi.advanceTimersByTime(5000);
		for (let i = 0; i < 9; i++) {
			ratelimit.limit('1.2.3.4');
		}
		vi.advanceTimersByTime(5000);

		expect(ratelimit.limit('1.2.3.4').success).toBe(true);
		expect(ratelimit.limit('1.2.3.4').success).toBe(false);
	});

	it('does not count blocked requests against the limit', () => {
		use_up_limit('1.2.3.4');
		for (let i = 0; i < 50; i++) {
			ratelimit.limit('1.2.3.4');
		}
		vi.advanceTimersByTime(10_000);

		expect(ratelimit.limit('1.2.3.4').success).toBe(true);
	});

	it('tracks each key separately', () => {
		use_up_limit('1.2.3.4');

		expect(ratelimit.limit('5.6.7.8').success).toBe(true);
		expect(ratelimit.limit('search_posts:1.2.3.4').success).toBe(
			true,
		);
	});
});
