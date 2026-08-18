import { query } from '$app/server';
import { get_shared_posts } from '#lib/server/bluesky-posts.js';
import * as v from 'valibot';

type BlueskyImage = {
	thumb: string;
	fullsize: string;
	alt?: string;
	aspectRatio?: { width: number; height: number };
};

export type BlueskyPost = {
	uri: string;
	author: {
		did: string;
		handle: string;
		displayName?: string;
		avatar?: string;
		labels?: Array<{ val: string }>;
	};
	record: { text?: string; createdAt?: string };
	embed?: {
		$type?: string;
		images?: BlueskyImage[];
	};
	likeCount?: number;
	replyCount?: number;
	repostCount?: number;
	labels?: Array<{ val: string }>;
};

export type BlueskyReply = BlueskyPost & {
	replies: BlueskyReply[];
};

type ThreadReply = {
	post?: BlueskyPost;
	replies?: ThreadReply[];
};

export type BlueskyRepliesData = {
	post_url: string;
	replies: BlueskyReply[];
};

const article_path = (value: string) =>
	new URL(value).pathname.replace(/\/$/, '');

const has_spam_label = (post: BlueskyPost) =>
	[...(post.labels ?? []), ...(post.author.labels ?? [])].some(
		(label) => label.val === 'spam',
	);

const build_reply_tree = (replies: ThreadReply[]): BlueskyReply[] =>
	replies.flatMap((reply) =>
		reply.post && !has_spam_label(reply.post)
			? [
					{
						...reply.post,
						replies: build_reply_tree(reply.replies ?? []),
					},
				]
			: [],
	);

export const get_bluesky_replies = query(
	v.pipe(v.string(), v.url()),
	async (article_url): Promise<BlueskyRepliesData | null> => {
		const shared_posts = await get_shared_posts(globalThis.fetch);
		const target_path = article_path(article_url);
		const matches = shared_posts.posts.filter(
			(post) => article_path(post.article_url) === target_path,
		);
		if (matches.length === 0) return null;

		const threads = await Promise.all(
			matches.map(async (post) => {
				const params = new URLSearchParams({
					uri: post.uri,
					depth: '10',
					parentHeight: '0',
				});
				const response = await globalThis.fetch(
					`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?${params}`,
				);
				if (!response.ok) return [];

				const data = (await response.json()) as {
					thread?: { replies?: ThreadReply[] };
				};
				return build_reply_tree(data.thread?.replies ?? []);
			}),
		);

		const replies = Array.from(
			new Map(
				threads.flat().map((post) => [post.uri, post]),
			).values(),
		).sort(
			(a, b) =>
				new Date(a.record.createdAt ?? 0).getTime() -
				new Date(b.record.createdAt ?? 0).getTime(),
		);
		const newest_post = matches.toSorted(
			(a, b) =>
				new Date(b.created_at ?? 0).getTime() -
				new Date(a.created_at ?? 0).getTime(),
		)[0];

		return { post_url: newest_post.url, replies };
	},
);
