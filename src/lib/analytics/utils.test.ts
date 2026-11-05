import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({ ANALYTICS_SALT: 'test-salt' }));

const { get_client_ip } = await import('./utils');

const request_with = (headers: Record<string, string>) =>
	new Request('https://scottspence.com/', { headers });

describe('get_client_ip', () => {
	it('uses the visitor IP from Cloudflare over the edge IP', () => {
		const request = request_with({
			'cf-connecting-ip': '203.0.113.7',
			'x-forwarded-for': '172.70.1.1',
		});
		expect(get_client_ip(request)).toBe('203.0.113.7');
	});

	it('falls back to the first x-forwarded-for entry', () => {
		const request = request_with({
			'x-forwarded-for': '198.51.100.2, 172.70.1.1',
		});
		expect(get_client_ip(request)).toBe('198.51.100.2');
	});

	it('returns null when no IP header is present', () => {
		expect(get_client_ip(request_with({}))).toBeNull();
	});
});
