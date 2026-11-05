import { describe, expect, it, vi } from 'vitest';

vi.mock('#lib/sqlite/client.js', () => ({
	sqlite_client: { batch: vi.fn() },
}));

const { queue_js_ping, get_js_ping_queue_length } =
	await import('./queue');

describe('queue_js_ping', () => {
	it('queues one ping per visitor and path', () => {
		const ping = {
			visitor_hash: 'abc',
			path: '/posts/a',
			created_at: 1,
		};

		queue_js_ping(ping);
		queue_js_ping({ ...ping, created_at: 2 });
		queue_js_ping({ ...ping, path: '/posts/b' });

		expect(get_js_ping_queue_length()).toBe(2);
	});
});
