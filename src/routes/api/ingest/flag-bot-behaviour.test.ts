import { describe, expect, it, vi } from 'vitest';
import {
	find_current_chrome_major,
	find_stale_chrome_agents,
	parse_desktop_chrome_major,
} from './flag-bot-behaviour';

vi.mock('#lib/sqlite/client.js', () => ({
	sqlite_client: {
		prepare: vi.fn(),
	},
}));

const windows_chrome = (major: number) =>
	`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`;
const mac_chrome = (major: number) =>
	`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`;
const android_chrome = (major: number) =>
	`Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`;

describe('parse_desktop_chrome_major', () => {
	it('reads the major version from desktop Chrome', () => {
		expect(parse_desktop_chrome_major(windows_chrome(155))).toBe(155);
		expect(parse_desktop_chrome_major(mac_chrome(131))).toBe(131);
		expect(
			parse_desktop_chrome_major(
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
			),
		).toBe(154);
	});

	it('skips mobile, ChromeOS and non-Chrome browsers', () => {
		expect(
			parse_desktop_chrome_major(android_chrome(119)),
		).toBeNull();
		expect(
			parse_desktop_chrome_major(
				'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			),
		).toBeNull();
		expect(
			parse_desktop_chrome_major(
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
			),
		).toBeNull();
	});
});

describe('find_current_chrome_major', () => {
	it('picks the major with the most referred visitors', () => {
		const stats = [
			{ user_agent: windows_chrome(155), referred_visitors: 150 },
			{ user_agent: mac_chrome(155), referred_visitors: 66 },
			{ user_agent: windows_chrome(154), referred_visitors: 129 },
			{ user_agent: windows_chrome(131), referred_visitors: 40 },
		];
		expect(find_current_chrome_major(stats, 30)).toBe(155);
	});

	it('ignores mobile visitors when finding current', () => {
		const stats = [
			{ user_agent: android_chrome(119), referred_visitors: 500 },
			{ user_agent: windows_chrome(155), referred_visitors: 40 },
		];
		expect(find_current_chrome_major(stats, 30)).toBe(155);
	});

	it('returns null when no major has enough visitors', () => {
		const stats = [
			{ user_agent: windows_chrome(155), referred_visitors: 12 },
			{ user_agent: windows_chrome(154), referred_visitors: 9 },
		];
		expect(find_current_chrome_major(stats, 30)).toBeNull();
		expect(find_current_chrome_major([], 30)).toBeNull();
	});

	it('prefers the newer major on a tie', () => {
		const stats = [
			{ user_agent: windows_chrome(154), referred_visitors: 50 },
			{ user_agent: windows_chrome(155), referred_visitors: 50 },
		];
		expect(find_current_chrome_major(stats, 30)).toBe(155);
	});
});

describe('find_stale_chrome_agents', () => {
	const stats = [
		windows_chrome(155),
		windows_chrome(143),
		windows_chrome(142),
		mac_chrome(125),
		android_chrome(110),
	].map((user_agent) => ({ user_agent, referred_visitors: 0 }));

	it('returns desktop Chrome more than the allowed majors behind', () => {
		expect(find_stale_chrome_agents(stats, 155, 12)).toEqual([
			windows_chrome(142),
			mac_chrome(125),
		]);
	});

	it('keeps the version exactly at the cutoff', () => {
		expect(find_stale_chrome_agents(stats, 155, 12)).not.toContain(
			windows_chrome(143),
		);
	});
});
