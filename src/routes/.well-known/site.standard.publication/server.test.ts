import { describe, expect, it } from 'vitest';

import { GET } from './+server';

describe('Standard.site publication verification', () => {
	it('returns the publication AT URI as plain text', async () => {
		const response = GET();

		expect(response.headers.get('content-type')).toBe(
			'text/plain; charset=utf-8',
		);
		expect(await response.text()).toBe(
			'at://did:plc:nlvjelw3dy3pddq7qoglleko/site.standard.publication/3ibdfz2k4a2kr',
		);
	});
});
