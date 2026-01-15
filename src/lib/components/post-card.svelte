<script lang="ts">
	import { differenceInDays, format } from 'date-fns'

	const { post }: { post: Post } = $props()
</script>

<div class="relative">
	<div
		class="rounded-box from-primary to-secondary absolute inset-0 bg-linear-to-r blur-sm"
	></div>
	<div class="relative">
		<article
			class="card bg-base-100 hover:text-accent mb-10 p-5 transition first:pt-0"
		>
			<a href={`/posts/${post.slug}`}>
				<div>
					<h2 class="mt-5 mb-2 text-3xl font-black text-balance">
						{post.title}
					</h2>
					<div class="text-accent mb-4 text-sm font-bold uppercase">
						<time>{format(new Date(post.date), 'MMMM d, yyyy')}</time>
						&bull;
						<span>{post.reading_time_text}</span>
						{#if differenceInDays(new Date(), new Date(post.date)) < 31}
							<span
								class="badge badge-sm bg-primary text-primary-content hover:bg-secondary hover:text-secondary-content relative -top-0.5 ml-1"
							>
								new
							</span>
						{/if}
					</div>
				</div>
				<div class="all-prose">
					{@html post.preview}
					<!-- wtf does this come from? -->
					<!-- {@html post.preview_html} -->
				</div>
			</a>
		</article>
	</div>
</div>
