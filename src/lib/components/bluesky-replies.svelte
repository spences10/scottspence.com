<script lang="ts">
	import type { BlueskyReply } from '#lib/data/bluesky-replies.remote.js';
	import { formatDistanceToNow } from 'date-fns';

	interface Props {
		post_url: string;
		replies: BlueskyReply[];
		heading?: string;
	}

	let {
		post_url,
		replies,
		heading = 'Replies on Bluesky',
	}: Props = $props();

	const post_link = (post: BlueskyReply) => {
		const record_key = post.uri.split('/').at(-1);
		return `https://bsky.app/profile/${post.author.did}/post/${record_key}`;
	};
</script>

{#snippet reply_item(reply: BlueskyReply, nested = false)}
	<li class:border-t={!nested} class="relative border-base-300 py-5">
		<article class="flex min-w-0 gap-3">
			<div class="relative z-10 shrink-0">
				{#if reply.author.avatar}
					<img
						class="size-10 rounded-full bg-base-300 object-cover"
						src={reply.author.avatar}
						alt=""
						width="40"
						height="40"
						loading="lazy"
					/>
				{:else}
					<div class="size-10 rounded-full bg-base-300"></div>
				{/if}
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-baseline gap-x-2 text-sm">
					<a
						class="truncate font-bold no-underline hover:underline"
						href={post_link(reply)}
						target="_blank"
						rel="noreferrer"
					>
						{reply.author.displayName || reply.author.handle}
					</a>
					<span class="truncate text-base-content/60">
						@{reply.author.handle}
					</span>
					{#if reply.record.createdAt}
						<span class="text-base-content/60">·</span>
						<time
							class="text-base-content/60"
							datetime={reply.record.createdAt}
						>
							{formatDistanceToNow(new Date(reply.record.createdAt), {
								addSuffix: true,
							})}
						</time>
					{/if}
				</div>
				<p class="mt-1 mb-0 whitespace-pre-wrap text-base-content/90">
					{reply.record.text ?? ''}
				</p>
				{#if reply.embed?.images?.length}
					<div
						class="mt-3 grid max-w-2xl grid-cols-2 gap-1 overflow-hidden rounded-xl"
					>
						{#each reply.embed.images as image (image.fullsize)}
							<a
								class:col-span-2={reply.embed.images.length === 1}
								class="block overflow-hidden bg-base-300"
								href={image.fullsize}
								target="_blank"
								rel="noreferrer"
							>
								<img
									class="h-auto max-h-128 w-full object-cover"
									src={image.thumb}
									alt={image.alt || 'Image attached to this reply'}
									width={image.aspectRatio?.width ?? 800}
									height={image.aspectRatio?.height ?? 450}
									loading="lazy"
									decoding="async"
									fetchpriority="low"
								/>
							</a>
						{/each}
					</div>
				{/if}
				<a
					class="mt-3 flex w-fit items-center gap-1.5 text-sm text-base-content/60 no-underline hover:text-primary"
					href={post_link(reply)}
					target="_blank"
					rel="noreferrer"
					aria-label={`View ${reply.replyCount ?? 0} replies and ${reply.likeCount ?? 0} likes on Bluesky`}
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						class="size-4 fill-none stroke-current"
						stroke-width="2"
					>
						<path
							d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
						/>
					</svg>
					<span>{reply.replyCount ?? 0}</span>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						class="ml-4 size-4 fill-none stroke-current"
						stroke-width="2"
					>
						<path
							d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z"
						/>
					</svg>
					<span>{reply.likeCount ?? 0}</span>
				</a>
			</div>
		</article>

		{#if reply.replies.length > 0}
			<ol
				class="thread-children ml-5 list-none border-l-2 border-base-300 pl-5"
			>
				{#each reply.replies as child (child.uri)}
					{@render reply_item(child, true)}
				{/each}
			</ol>
		{/if}
	</li>
{/snippet}

<section class="my-16" aria-labelledby="bluesky-replies-heading">
	<div
		class="mb-6 flex flex-wrap items-baseline justify-between gap-3 border-b border-base-300 pb-3"
	>
		<h2 id="bluesky-replies-heading" class="m-0 text-3xl font-black">
			{heading}
		</h2>
		<a
			class="link font-bold link-primary"
			href={post_url}
			target="_blank"
			rel="noreferrer"
		>
			Say something ↗
		</a>
	</div>

	{#if replies.length === 0}
		<p class="text-base-content/70">
			No replies yet. You could be the first.
		</p>
	{:else}
		<ol class="m-0 list-none p-0">
			{#each replies as reply (reply.uri)}
				{@render reply_item(reply)}
			{/each}
		</ol>
	{/if}
</section>
