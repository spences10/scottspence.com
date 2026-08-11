import { describe, expect, it } from 'vitest';

import {
	standard_site,
	standard_site_document_rkey,
	standard_site_document_uri,
	standard_site_publication_uri,
	standard_site_rkey,
} from './standard-site';

const TID_PATTERN =
	/^[234567abcdefghij][234567abcdefghijklmnopqrstuvwxyz]{12}$/;

describe('Standard.site record keys', () => {
	it('uses a stable TID for the publication record', () => {
		expect(standard_site.publication_rkey).toBe('3ibdfz2k4a2kr');
		expect(standard_site.publication_rkey).toMatch(TID_PATTERN);
		expect(standard_site_publication_uri).toBe(
			'at://did:plc:nlvjelw3dy3pddq7qoglleko/site.standard.publication/3ibdfz2k4a2kr',
		);
	});

	it('creates stable, valid and distinct document TIDs', () => {
		const first = standard_site_document_rkey(
			'a-digital-garden',
			'2020-04-27',
		);
		const second = standard_site_document_rkey(
			'continus-deployment',
			'2020-04-27',
		);

		expect(first).toBe('3h6bdmqmc22xh');
		expect(first).toMatch(TID_PATTERN);
		expect(second).toMatch(TID_PATTERN);
		expect(second).not.toBe(first);
	});

	it('builds a document verification URI from its TID', () => {
		expect(
			standard_site_document_uri(
				'beginner-to-git-aliases',
				'2017-06-01',
			),
		).toBe(
			'at://did:plc:nlvjelw3dy3pddq7qoglleko/site.standard.document/3ekvevwkk22wz',
		);
	});

	it('rejects invalid publication dates', () => {
		expect(() => standard_site_rkey('not-a-date', 'post')).toThrow(
			'Invalid Standard.site date',
		);
	});
});
