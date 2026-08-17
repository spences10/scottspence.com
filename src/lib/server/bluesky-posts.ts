import { standard_site } from '#lib/standard-site.js';

const BLUESKY_API = 'https://public.api.bsky.app/xrpc';
const SITE_HOST = 'scottspence.com';
const BLUESKY_HANDLE = 'scottspence.dev';
const PAGE_LIMIT = 100;
const MAX_PAGES = 50;
const CACHE_TTL = 60 * 60 * 1000;

type FeedPost = {
	uri: string;
	author: { did: string };
	record: {
		text?: string;
		createdAt?: string;
		facets?: Array<{ features?: Array<{ uri?: string }> }>;
	};
	embed?: { external?: { uri?: string } };
	replyCount?: number;
	likeCount?: number;
	repostCount?: number;
};

type FeedResponse = {
	feed?: Array<{ post: FeedPost }>;
	cursor?: string;
};

export type SharedPost = {
	article_url: string;
	post_id?: string;
	uri: string;
	url: string;
	text: string;
	created_at?: string;
	reply_count: number;
	like_count: number;
	repost_count: number;
};

export type SharedPostsData = {
	did: string;
	handle: string;
	posts: SharedPost[];
	count: number;
	pages_scanned: number;
	truncated: boolean;
};

let cached: { data: SharedPostsData; expires: number } | undefined;
let pending: Promise<SharedPostsData> | undefined;

const normalise_article_url = (value: string) => {
	try {
		const url = new URL(value);
		if (
			url.hostname !== SITE_HOST ||
			!url.pathname.startsWith('/posts/')
		)
			return;
		url.search = '';
		url.hash = '';
		url.pathname = url.pathname.replace(/\/$/, '');
		return url.toString();
	} catch {
		return;
	}
};

const get_article_url = (post: FeedPost) => {
	const candidates = [
		post.embed?.external?.uri,
		...(post.record.facets ?? []).flatMap((facet) =>
			(facet.features ?? []).map((feature) => feature.uri),
		),
	];
	for (const candidate of candidates) {
		if (!candidate) continue;
		const article_url = normalise_article_url(candidate);
		if (article_url) return article_url;
	}
};

const scan_posts = async (
	fetcher: typeof fetch,
): Promise<SharedPostsData> => {
	const posts: SharedPost[] = [];
	const seen = new Set<string>();
	let cursor: string | undefined;
	let pages_scanned = 0;

	do {
		const params = new URLSearchParams({
			actor: standard_site.did,
			filter: 'posts_no_replies',
			limit: String(PAGE_LIMIT),
		});
		if (cursor) params.set('cursor', cursor);
		const response = await fetcher(
			`${BLUESKY_API}/app.bsky.feed.getAuthorFeed?${params}`,
		);
		if (!response.ok)
			throw new Error('Bluesky feed could not be loaded.');

		const data = (await response.json()) as FeedResponse;
		pages_scanned += 1;
		for (const { post } of data.feed ?? []) {
			if (post.author.did !== standard_site.did || seen.has(post.uri))
				continue;
			const article_url = get_article_url(post);
			if (!article_url) continue;

			seen.add(post.uri);
			const post_id = post.uri.split('/').at(-1);
			posts.push({
				article_url,
				post_id,
				uri: post.uri,
				url: `https://bsky.app/profile/${BLUESKY_HANDLE}/post/${post_id}`,
				text: post.record.text ?? '',
				created_at: post.record.createdAt,
				reply_count: post.replyCount ?? 0,
				like_count: post.likeCount ?? 0,
				repost_count: post.repostCount ?? 0,
			});
		}
		cursor = data.cursor;
	} while (cursor && pages_scanned < MAX_PAGES);

	return {
		did: standard_site.did,
		handle: BLUESKY_HANDLE,
		posts,
		count: posts.length,
		pages_scanned,
		truncated: Boolean(cursor),
	};
};

export const get_shared_posts = async (fetcher: typeof fetch) => {
	if (cached && cached.expires > Date.now()) return cached.data;
	if (pending) return pending;

	pending = scan_posts(fetcher);
	try {
		const data = await pending;
		cached = { data, expires: Date.now() + CACHE_TTL };
		return data;
	} finally {
		pending = undefined;
	}
};
