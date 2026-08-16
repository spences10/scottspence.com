import {
	ATPROTO_APP_PASSWORD,
	ATPROTO_IDENTIFIER,
	ATPROTO_SERVICE,
} from '$app/env/private';
import { description, name, website } from '#lib/info.js';
import {
	standard_site,
	standard_site_document_rkey,
	standard_site_publication_uri,
} from '#lib/standard-site.js';
import * as v from 'valibot';

interface PostModule {
	metadata: Post & { updated?: string };
}
interface Session {
	accessJwt: string;
	did: string;
}

interface BlobReference {
	$type: 'blob';
	ref: { $link: string };
	mimeType: string;
	size: number;
}

interface DidDocument {
	service?: Array<{
		id: string;
		serviceEndpoint: string;
		type: string;
	}>;
}

export interface StandardSiteDocument {
	rkey: string;
	record: Record<string, unknown>;
}

const standard_site_sync_schema = v.object({
	mode: v.picklist(['preview', 'publish']),
	slug: v.optional(
		v.pipe(v.string(), v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
	),
	confirm: v.optional(v.boolean()),
});

export type StandardSiteSyncData = v.InferOutput<
	typeof standard_site_sync_schema
>;
export const validate_standard_site_sync = (
	data: unknown,
): StandardSiteSyncData => v.parse(standard_site_sync_schema, data);

const request = async <T>(
	fetch: typeof globalThis.fetch,
	service: string,
	method: string,
	body: Record<string, unknown>,
	token?: string,
): Promise<T> => {
	const response = await fetch(`${service}/xrpc/${method}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error(
			`${method} failed (${response.status}): ${await response.text()}`,
		);
	}

	return response.json() as Promise<T>;
};

const to_iso_date = (date: string, slug: string) => {
	const parsed = new Date(date);

	if (Number.isNaN(parsed.getTime())) {
		throw new Error(`Invalid date for post "${slug}": ${date}`);
	}

	return parsed.toISOString();
};

export const to_plain_text = (markdown: string) =>
	markdown
		.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/```[^\n]*\n([\s\S]*?)```/g, '$1')
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/^\s{0,3}>\s?/gm, '')
		.replace(/^\s*[-+*]\s+/gm, '')
		.replace(/^\s*\d+\.\s+/gm, '')
		.replace(/\{[#/:@][^}]+\}/g, '')
		.replace(/[*_~`]/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&')
		.replace(/[\t ]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

export const build_standard_site_document = (
	slug: string,
	metadata: PostModule['metadata'],
	markdown: string,
): StandardSiteDocument => {
	const text_content = to_plain_text(markdown);
	const description_text = String(metadata.preview ?? '').slice(
		0,
		3000,
	);

	return {
		rkey: standard_site_document_rkey(slug, metadata.date),
		record: {
			$type: standard_site.document_collection,
			site: standard_site_publication_uri,
			path: `/posts/${slug}`,
			title: metadata.title,
			publishedAt: to_iso_date(metadata.date, slug),
			...(description_text ? { description: description_text } : {}),
			...(metadata.updated
				? { updatedAt: to_iso_date(metadata.updated, slug) }
				: {}),
			...(Array.isArray(metadata.tags) && metadata.tags.length > 0
				? { tags: metadata.tags }
				: {}),
			...(text_content ? { textContent: text_content } : {}),
		},
	};
};

const get_documents = async (
	slug_filter?: string,
): Promise<StandardSiteDocument[]> => {
	const post_modules = import.meta.glob<PostModule>(
		'../../../../posts/**/*.md',
	);
	const raw_posts = import.meta.glob<string>(
		'../../../../posts/**/*.md',
		{ query: '?raw', import: 'default' },
	);
	const documents: StandardSiteDocument[] = [];
	const document_rkeys = new Set<string>();

	for (const path of Object.keys(post_modules).sort()) {
		const slug = path.split('/').pop()?.slice(0, -3) ?? '';
		if (slug_filter && slug !== slug_filter) continue;

		const [{ metadata }, markdown] = await Promise.all([
			post_modules[path](),
			raw_posts[path](),
		]);
		if (metadata.is_private) continue;

		const document = build_standard_site_document(
			slug,
			metadata,
			markdown,
		);
		if (document_rkeys.has(document.rkey)) {
			throw new Error(
				`Duplicate Standard.site record key for post "${slug}"`,
			);
		}

		document_rkeys.add(document.rkey);
		documents.push(document);
	}

	if (slug_filter && documents.length === 0) {
		throw new Error(
			`No public post found with slug "${slug_filter}"`,
		);
	}

	return documents;
};

export const get_standard_site_icon = async (
	fetch: typeof globalThis.fetch,
	service: string,
) => {
	const params = new URLSearchParams({
		repo: standard_site.did,
		collection: 'app.bsky.actor.profile',
		rkey: 'self',
	});
	const response = await fetch(
		`${service}/xrpc/com.atproto.repo.getRecord?${params}`,
	);

	if (!response.ok) {
		throw new Error(
			`Unable to read AT Protocol profile (${response.status})`,
		);
	}

	const profile = (await response.json()) as {
		value?: { avatar?: Partial<BlobReference> };
	};
	const avatar = profile.value?.avatar;

	if (
		avatar?.$type !== 'blob' ||
		typeof avatar.ref?.$link !== 'string' ||
		!avatar.mimeType?.startsWith('image/') ||
		typeof avatar.size !== 'number' ||
		avatar.size > 1_000_000
	) {
		throw new Error('AT Protocol profile has no suitable avatar');
	}

	return avatar as BlobReference;
};

export const resolve_standard_site_pds = async (
	fetch: typeof globalThis.fetch,
) => {
	const configured_service = ATPROTO_SERVICE.trim();

	if (configured_service)
		return configured_service.replace(/\/$/, '');

	const response = await fetch(
		`https://plc.directory/${standard_site.did}`,
	);

	if (!response.ok) {
		throw new Error(
			`Unable to resolve AT Protocol identity (${response.status})`,
		);
	}

	const did_document = (await response.json()) as DidDocument;
	const pds = did_document.service?.find(
		(service) =>
			service.type === 'AtprotoPersonalDataServer' ||
			service.id.endsWith('#atproto_pds'),
	);

	if (!pds?.serviceEndpoint) {
		throw new Error(
			`No AT Protocol PDS found for ${standard_site.did}`,
		);
	}

	return pds.serviceEndpoint.replace(/\/$/, '');
};

const put_records = async (
	fetch: typeof globalThis.fetch,
	service: string,
	session: Session,
	documents: StandardSiteDocument[],
) => {
	const icon = await get_standard_site_icon(fetch, service);
	const records = [
		{
			collection: standard_site.publication_collection,
			rkey: standard_site.publication_rkey,
			record: {
				$type: standard_site.publication_collection,
				url: website,
				name,
				description,
				icon,
				preferences: { showInDiscover: true },
			},
		},
		...documents.map(({ rkey, record }) => ({
			collection: standard_site.document_collection,
			rkey,
			record,
		})),
	];

	for (let index = 0; index < records.length; index += 10) {
		await Promise.all(
			records.slice(index, index + 10).map((record) =>
				request(
					fetch,
					service,
					'com.atproto.repo.putRecord',
					{
						repo: session.did,
						...record,
					},
					session.accessJwt,
				),
			),
		);
	}
};

export const standard_site_sync = async (
	fetch: typeof globalThis.fetch,
	data: StandardSiteSyncData,
) => {
	const documents = await get_documents(data.slug);

	if (data.mode === 'preview') {
		return {
			success: true,
			mode: 'preview',
			writes_performed: 0,
			publication: standard_site_publication_uri,
			document_count: documents.length,
			documents: documents.slice(0, 10).map(({ rkey, record }) => ({
				uri: `at://${standard_site.did}/${standard_site.document_collection}/${rkey}`,
				rkey,
				title: record.title,
				path: record.path,
				text_length: String(record.textContent ?? '').length,
			})),
		};
	}

	if (data.confirm !== true) {
		throw new Error(
			'Publishing requires {"mode":"publish","confirm":true}',
		);
	}

	if (!ATPROTO_APP_PASSWORD) {
		throw new Error('AT Protocol app password is not configured');
	}

	const service = await resolve_standard_site_pds(fetch);
	const session = await request<Session>(
		fetch,
		service,
		'com.atproto.server.createSession',
		{
			identifier: ATPROTO_IDENTIFIER || standard_site.did,
			password: ATPROTO_APP_PASSWORD,
		},
	);

	if (session.did !== standard_site.did) {
		throw new Error(
			`Signed in as ${session.did}, expected ${standard_site.did}. Nothing was written.`,
		);
	}

	await put_records(fetch, service, session, documents);

	return {
		success: true,
		mode: 'publish',
		published: documents.length,
		publication: standard_site_publication_uri,
	};
};
