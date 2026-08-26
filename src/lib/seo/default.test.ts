import { describe, expect, it } from 'vitest';

import { create_meta_description } from './default.js';

describe('create_meta_description', () => {
	it('keeps short descriptions unchanged', () => {
		expect(create_meta_description('A concise description.')).toBe(
			'A concise description.',
		);
	});

	it('normalises whitespace and truncates at a word boundary', () => {
		const description = create_meta_description(
			'Agentic   engineering\nis a practical way to build reliable coding agents.',
			45,
		);

		expect(description).toBe(
			'Agentic engineering is a practical way to...',
		);
		expect(description.length).toBeLessThanOrEqual(48);
	});
});
