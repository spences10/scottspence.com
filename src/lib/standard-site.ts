const S32_CHARACTERS = '234567abcdefghijklmnopqrstuvwxyz';
const TID_LENGTH = 13;
const TID_CLOCK_ID_LIMIT = 1024;

const encode_s32 = (value: number) => {
	let remaining = value;
	let encoded = '';

	while (remaining > 0) {
		encoded = S32_CHARACTERS.charAt(remaining % 32) + encoded;
		remaining = Math.floor(remaining / 32);
	}

	return encoded;
};

const hash_string = (value: string) => {
	let hash = 0x811c9dc5;

	for (let index = 0; index < value.length; index++) {
		hash ^= value.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}

	return hash >>> 0;
};

export const standard_site_rkey = (
	published_at: string,
	identifier: string,
) => {
	const timestamp = new Date(published_at).getTime();

	if (!Number.isFinite(timestamp)) {
		throw new Error(`Invalid Standard.site date: ${published_at}`);
	}

	const timestamp_microseconds = timestamp * 1000;
	const clock_id = hash_string(identifier) % TID_CLOCK_ID_LIMIT;

	return (
		encode_s32(timestamp_microseconds).padStart(TID_LENGTH - 2, '2') +
		encode_s32(clock_id).padStart(2, '2')
	);
};

export const standard_site = {
	did: 'did:plc:nlvjelw3dy3pddq7qoglleko',
	document_collection: 'site.standard.document',
	publication_collection: 'site.standard.publication',
	publication_rkey: standard_site_rkey(
		'2021-07-17T05:29:47.000Z',
		'scottspence.com',
	),
} as const;

export const standard_site_publication_uri = `at://${standard_site.did}/${standard_site.publication_collection}/${standard_site.publication_rkey}`;

export const standard_site_document_rkey = (
	slug: string,
	published_at: string,
) => standard_site_rkey(published_at, slug);

export const standard_site_document_uri = (
	slug: string,
	published_at: string,
) =>
	`at://${standard_site.did}/${standard_site.document_collection}/${standard_site_document_rkey(slug, published_at)}`;
