import { describe, expect, it } from 'vitest';
import { get_referrer_icon } from './referrer-icons';

const link_icon = get_referrer_icon('Direct');

describe('get_referrer_icon', () => {
	it('matches canonical search engine names', () => {
		for (const name of [
			'Google',
			'Bing',
			'DuckDuckGo',
			'Brave Search',
		]) {
			expect(get_referrer_icon(name)).not.toBe(link_icon);
		}
	});

	it('matches hostnames, including subdomains', () => {
		expect(get_referrer_icon('reddit.com')).toBe(
			get_referrer_icon('old.reddit.com'),
		);
		expect(get_referrer_icon('reddit.com')).not.toBe(link_icon);
		expect(get_referrer_icon('chatgpt.com')).not.toBe(link_icon);
	});

	it('gives Gemini its own icon rather than Google', () => {
		expect(get_referrer_icon('gemini.google.com')).not.toBe(
			get_referrer_icon('Google'),
		);
	});

	it('falls back to the link icon for unknown sources', () => {
		expect(get_referrer_icon('amanhimself.dev')).toBe(link_icon);
		expect(get_referrer_icon('notgoogle.example')).toBe(link_icon);
	});
});
